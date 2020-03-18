const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const { validationResult } = require('express-validator');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}));
exports.getSignUp = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: message,
        oldInput: { email: '' }
    });
}

exports.postSignUp = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const comfirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup',
            errorMessage: errors.array()[0].msg,
            oldInput: { email: email }
        });
    }

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'manojshopping@gmail.com',
                subject: 'Signup succeeded!',
                html: '<h1>You successfully signed up!</h1>'
            });

        })
        .catch((err) => {
            next(new Error(err));
        });
}

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message
    });
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: errors.array()[0].msg
        });
    }
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    pageTitle: 'Login',
                    path: '/login',
                    errorMessage: 'Invalid Email or Password'
                });
            }

            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    req.flash('error', 'Invalid Email or Password');
                    res.redirect('/login');
                })
                .catch(err => {
                    next(new Error(err));
                })
        });
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
}

exports.getResetPassword = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset', {
        pageTitle: 'Reset Password',
        path: '/resetPassword',
        errorMessage: message
    });
}

exports.postResetPassword = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/resetPassword');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email found');
                    return res.redirect('/resetPassword');
                }

                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 36000;
                return user.save();
            })
            .then(result => {
                res.redirect('/');
                transporter.sendMail({
                    to: req.body.email,
                    from: 'manojshopping@gmail.com',
                    subject: 'Password Reset',
                    html: `
                        <p>You requested a password reset</p>
                        <p>Click this <a href="http://localhost:3000/newPassword/${token}">link</a> to rest a new password.</p>
                    `
                })
            })
            .catch(err => {
                next(new Error(err));
            });
    });
}

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token })
        .then(user => {
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0];
            } else {
                message = null;
            }
            res.render('auth/new-password', {
                pageTitle: 'New Password',
                path: '/newPassword',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: token
            });
        })
        .catch(err => {
            next(new Error(err));
        });
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const passwordToken = req.body.passwordToken;
    const userId = req.body.userId;
    let resetUser;

    User.findOne({ _id: userId, resetToken: passwordToken })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hasedPassword => {
            resetUser.password = hasedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(() => {
            res.redirect('/');
        })
        .catch(err => {
            next(new Error(err));
        });
}