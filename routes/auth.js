const express = require('express');

const User = require('../models/user');

const { body } = require('express-validator');

const router = express.Router();

const authController = require('../controllers/auth');

router.get('/signup', authController.getSignUp);

router.post('/signup', [
    body('email', 'Please enter a valid email.')
    .isEmail()
    .custom((value, { req }) => {
        return User.findOne({ email: value })
            .then(userDoc => {
                if (userDoc) {
                    return Promise.reject('Email exists aleardy.');
                }
            })
    }),
    body('password', 'Please enter password atleast 6 characters.')
    .isLength({ min: 6 }),
    body('confirmPassword')
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords have to match');
        }
        return true;
    })
], authController.postSignUp);

router.get('/login', authController.getLogin);

router.post('/login', [
    body('email', 'Please enter valid email.')
    .isEmail(),
    body('password', 'Please enter valid password.')
    .isLength({ min: 6 })
], authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/resetPassword', authController.getResetPassword);

router.post('/resetPassword', authController.postResetPassword);

router.get('/newPassword/:token', authController.getNewPassword);

router.post('/newPassword', authController.postNewPassword);

module.exports = router;