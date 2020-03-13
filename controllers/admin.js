const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        formsCSS: true,
        productCSS: true,
        activeAddProduct: true
    });
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product({
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description,
        userId: req.user
    });
    product.save()
        .then(result => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        });

}

exports.getEditProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            res.render('admin/edit-product', {
                product: product,
                pageTitle: 'Edit Product',
                path: '/admin/products'
            });
        })
        .catch(err => {
            console.log(err);
        });
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const UpdatedPrice = req.body.price;
    const UpdatedDescription = req.body.description;
    const updatedImageUrl = req.body.imageUrl;

    Product.findById(prodId)
        .then(product => {
            product.title = updatedTitle,
                product.price = UpdatedPrice,
                product.imageUrl = updatedImageUrl,
                product.description = UpdatedDescription
            return product.save();
        })
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
        });
}

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            })
        })
        .catch(err => {
            console.log(err);
        });
}

exports.getDeleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findByIdAndRemove(prodId)
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
        })
}