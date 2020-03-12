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
        description: description
    });
    product.save()
        .then(result => {
            res.redirect('/');
        })
        .catch(err => {
            console.log(err);
        });

}
const products = [{
    id: 1,
    title: 'Book',
    imageUrl: 'url',
    price: '30',
    description: 'Awesome Book',
}];

exports.getProducts = (req, res, next) => {
    res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
    })
}