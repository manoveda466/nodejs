const express = require('express');

const shopController = require('../controllers/shop');

router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

//router.get('/products/delete');

router.get('/products/:productId', shopController.getProductDetail);

router.get('/cart', shopController.getCart);

router.get('/chekout', shopController.getCheckout);

router.get('/orders', shopController.getOrders);

module.exports = router;