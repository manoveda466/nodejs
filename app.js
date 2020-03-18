const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongodbStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const multer = require('multer');

const csrf = require('csurf');

const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://manoj_db:Password!23@cluster0-zmswe.mongodb.net/nodedemo';

const app = express();
const store = new MongodbStore({
    uri: MONGODB_URI,
    collection: 'session'
});

const csrfProtction = csrf({});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const errorController = require('./controllers/error');

const User = require('./models/user');

app.use(bodyParser.urlencoded({ extended: false }));
//file upload
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().getUTCMilliseconds() + '_' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

app.use(csrfProtction);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthentication = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err));
        });
});



app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500Page);

app.use(errorController.get404Page);

//error handling middleware
app.use((error, req, res, next) => {
    res.status(500).render('500', { pageTitle: 'Error', path: '/500' });
})

mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });