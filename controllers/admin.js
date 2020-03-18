const Product = require('../models/product');

const fileDeleteHelper = require('../util/deleteFile');

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
    const image = req.file;
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
                price: price,
                description: description
            }
        });
    }
    if (!image) {
        return res.status(422).render('admin/add-edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            validationErrors: [{ msg: 'Upload valid image file.' }],
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description
            }
        });
    }
    const product = new Product({
        title: title,
        imageUrl: image.path,
        price: price,
        description: description,
        userId: req.user
    });
    product.save()
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            next(new Error(err));
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
            next(new Error(err));
        });
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const UpdatedPrice = req.body.price;
    const UpdatedDescription = req.body.description;
    const updatedImage = req.file;
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
            product.title = updatedTitle;
            product.price = UpdatedPrice;
            if (updatedImage) {
                fileDeleteHelper.deleteFile(product.imageUrl);
                product.imageUrl = updatedImage.path;
            }
            product.description = UpdatedDescription;
            return product.save().then(result => {
                res.redirect('/admin/products');
            });
        })
        .catch(err => {
            next(new Error(err));
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
            next(new Error(err));
        });
}

exports.getDeleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            fileDeleteHelper.deleteFile(product.imageUrl);
            return Product.deleteOne({ _id: prodId, userId: req.user._id });
        })
        .then(result => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            next(new Error(err));
        });
}