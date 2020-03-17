const Product = require('../models/product');

const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        validationErrors: [],
        hasError: false
    });
}

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/add-edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            validationErrors: errors.array(),
            hasError: true,
            product: {
                title: title,
                imageUrl: imageUrl,
                price: price,
                description: description
            }
        });
    }
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
            res.render('admin/add-edit-product', {
                product: product,
                pageTitle: 'Edit Product',
                path: '/admin/products',
                editing: true,
                validationErrors: [],
                hasError: false,
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/add-edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: false,
            validationErrors: errors.array(),
            hasError: true,
            editing: true,
            product: {
                _id: prodId,
                title: updatedTitle,
                imageUrl: updatedImageUrl,
                price: UpdatedPrice,
                description: UpdatedDescription
            }
        });
    }

    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.title = updatedTitle,
                product.price = UpdatedPrice,
                product.imageUrl = updatedImageUrl,
                product.description = UpdatedDescription
            return product.save().then(result => {
                res.redirect('/admin/products');
            });
        })
        .catch(err => {
            console.log(err);
        });
}

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
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
    Product.deleteOne({ _id: prodId, userId: req.user._id })
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            console.log(err);
        })
}