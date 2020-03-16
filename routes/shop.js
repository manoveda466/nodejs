const express = require('express');

const shopController = require('../controllers/shop');

const isAuth = require('../middleware/is-auth');

router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProductDetail);

router.get('/cart', isAuth, shopController.getCart);

router.get('/add-to-cart/:productId', isAuth, shopController.getAddToCart);

router.post('/cart-delete-item', isAuth, shopController.postDeleteCartItems);

router.get('/chekout', shopController.getCheckout);

router.post('/create-order', isAuth, shopController.postOrders);

router.get('/orders', isAuth, shopController.getOrders);

module.exports = router;