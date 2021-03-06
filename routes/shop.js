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

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/checkout/success', shopController.postOrders);

router.get('/checkout/cancel', shopController.getCheckout);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;