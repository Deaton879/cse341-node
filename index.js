const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const PORT = process.env.PORT || 5000 // So we can run on heroku || (OR) localhost:5000
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = "mongodb+srv://Deaton879:Mongoacct1@cluster0.co7ly.mongodb.net/shrouded-dawn-21361?retryWrites=true&w=majority";
// process.env.MONGODB_URL ||

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
// const product = require('./models/product');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
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
      res.locals.firstName = user.firstName;
      res.locals.lastName = user.lastName;
      res.locals.name = user.firstName + " " + user.lastName;
      res.locals.cart = user.cart.items;
      res.locals.email = user.email;
      let subtotal = 0;
      let totalCount = 0;
      let tax = 0;
      
      user.cart.items.forEach(x => {
        let count = x.quantity;
        subtotal += (count * x.price);
        totalCount += count;
      });
      tax = subtotal * .06;

      res.locals.subtotal = subtotal;
      res.locals.total = (subtotal + tax).toFixed(2);
      res.locals.cartCount = totalCount;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});

const corsOptions = {
  origin: "https://shrouded-dawn-21361.herokuapp.com/",
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  family: 4
};

mongoose
  .connect(MONGODB_URI, options)
  .then(result => {
    app.listen(PORT);
  })
  .catch(err => {
    console.log(err);
  });
