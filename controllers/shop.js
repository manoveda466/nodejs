const products = [{
    id: 1,
    title: 'Book',
    imageUrl: 'url',
    price: '30',
    description: 'Awesome Book',
}];

exports.getProducts = (req, res, next) => {
    res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Shop',
        path: '/products'
    });
}

exports.getProductDetail = (req, res, next) => {
    const prodId = req.params.productId;
    console.log(prodId);
    res.redirect('/');
}

exports.getIndex = (req, res, next) => {
    res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
    });
}

exports.getCart = (req, res, next) => {
    res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart'
    })
}

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout'
    })
}

exports.getOrders = (req, res, next) => {
    res.render('shop/order', {
        path: '/orders',
        pageTitle: 'Your Orders'
    })
}