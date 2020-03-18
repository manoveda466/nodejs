const express = require('express');

const { body } = require('express-validator');

const router = express.Router();

const adminController = require('../controllers/admin');

const isAuth = require('../middleware/is-auth');

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', isAuth, [
    body('title', 'Title should not be empty')
    .not().isEmpty(),
    body('price', 'Price should not be empty')
    .isNumeric(),
    body('description', 'Description should not be empty')
    .not().isEmpty(),
], adminController.postAddProduct);

// /admin/edit-product => GET
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post('/edit-product', isAuth, [
    body('title', 'Title should not be empty')
    .not().isEmpty(),
    body('price', 'Price should not be empty')
    .isNumeric(),
    body('description', 'Description should not be empty')
    .not().isEmpty(),
], adminController.postEditProduct);

// /admin/delete-product => GET
router.get('/delete-product/:productId', isAuth, adminController.getDeleteProduct);

module.exports = router;