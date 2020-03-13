const express = require('express');

const shopController = require('../controllers/shop');

router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProductDetail);

router.get('/cart', shopController.getCart);

router.get('/add-to-cart/:productId', shopController.getAddToCart);

router.post('/cart-delete-item', shopController.postDeleteCartItems);

router.get('/chekout', shopController.getCheckout);

router.post('/create-order', shopController.postOrders);

router.get('/orders', shopController.getOrders);

module.exports = router;