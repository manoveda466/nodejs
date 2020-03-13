const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');

const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('5e6b5472ef5e0a18d8e80d86')
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            console.log(err);
        });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404Page);

mongoose.connect('mongodb+srv://manoj_db:Password!23@cluster0-zmswe.mongodb.net/nodedemo?retryWrites=true&w=majority')
    .then(result => {
        User.findOne()
            .then(user => {
                if (!user) {
                    const user = new User({
                        name: 'Manoj',
                        email: 'manov14@yahoo.com'
                    });
                    user.save();
                }
            })
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });