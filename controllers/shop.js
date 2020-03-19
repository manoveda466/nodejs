const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDcoument = require('pdfkit');
const stripe = require('stripe')('sk_test_0mGIycGSyX2q9dgHnERSzJlQ');

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'Shop',
                path: '/products'
            });
        })
        .catch(err => {
            next(new Error(err));
        });
}

exports.getProductDetail = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: 'ShopProduct Detail',
                path: '/products'
            });
        })
        .catch(err => {
            next(new Error(err));
        });
}

exports.getIndex = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/'
            });
        })
        .catch(err => {
            next(new Error(err));
        });
}

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items;
            res.render('shop/cart', {
                products: products,
                path: '/cart',
                pageTitle: 'Your Cart'
            })
        })
        .catch(err => {
            next(new Error(err));
        });
}

exports.getAddToCart = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
            next(new Error(err));
        })
}

exports.postDeleteCartItems = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.deleteFromCart(prodId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {
            next(new Error(err));
        });
}

exports.getCheckout = (req, res, next) => {
    let products;
    let totalSum = 0;
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            products = user.cart.items;
            totalSum = 0;
            products.forEach(p => {
                totalSum += p.quantity * p.productId.price;
            });
            return stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map(p => {
                    return {
                        name: p.productId.title,
                        description: p.productId.description,
                        amount: p.productId.price * 100,
                        currency: 'inr',
                        quantity: p.quantity
                    };
                }),
                success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000/checkout/success
                cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
            });
        })
        .then(session => {
            res.render('shop/checkout', {
                products: products,
                path: '/checkout',
                pageTitle: 'Checkout',
                totalSum: totalSum,
                sessionId: session.id
            })
        })
        .catch(err => {
            console.log(err);
            next(new Error(err));
        });
}

exports.postOrders = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: {...i.productId._doc } };
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            });
            return order.save();
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => {
            next(new Error(err));
        });
}

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/order', {
                orders: orders,
                path: '/orders',
                pageTitle: 'Your Orders'
            })
        })
        .catch(err => {
            next(new Error(err));
        });
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('invoices', invoiceName);
    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return next(new Error('No order found'));
            }

            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized'));
            }
            const pdfDoc = new PDFDcoument();
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);
            pdfDoc.fontSize(26).text('Invoice');
            pdfDoc.text('----------------------------');
            let totalPrice = 0;
            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price;
                pdfDoc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + 'x' + '$' + prod.product.price);
            });
            pdfDoc.text('--------------------');
            pdfDoc.fontSize(20).text('Total Price :' + totalPrice);
            pdfDoc.end();

            const file = fs.createReadStream(invoicePath);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename = "' + invoiceName + '"');
            file.pipe(res);

        })
        .catch(err => {
            return next(new Error('Unauthorized'));
        });

}