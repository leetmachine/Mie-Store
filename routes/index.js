var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');

var Product = require('../models/product');
var Order = require('../models/order');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {title: 'mie',showShop: false});
});

router.get('/shop', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  Product.find(function(err, docs) {
    var productChunks = [];
    var chunkSize = 3;
    for (var i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i+ chunkSize));
    }
    res.render('shop/shop', {title: 'mie', products: productChunks, successMsg: successMsg, noMesssages: !successMsg, showShop: true});
  });
});

router.get('/add-to-cart/:id/:size', function(req, res, next){
  var productId = req.params.id;
  var size = req.params.size;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, function(err, product){
    if (err){
      return res.redirect('/shop');
    }
    cart.add(product, product.id, size);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect('/shop');
  });
});

router.get('/reduce/:id/:size', function(req, res, next){
  var productId = req.params.id;
  var size = req.params.size;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId, size);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next){
  if (!req.session.cart){
    return res.render('shop/shopping-cart', {products: null, showShop: true});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice, showShop: true});
});

router.get('/shipping-check', isLoggedIn, function(req, res, next){
  if (!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shipping-check', {showShop: true});

});

router.get('/addFee', isLoggedIn, function(req, res, next){
  if (!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);

  cart.yesShipping();
  req.session.cart = cart;
  res.redirect('/checkout');
});

router.get('/noFee', isLoggedIn, function(req, res, next){
  if (!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);

  cart.noShipping();
  req.session.cart = cart;
  res.redirect('/checkout');
});

router.get('/checkout', isLoggedIn, function(req, res, next){
  if (!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noErrors: !errMsg, showShop: true});
});

router.post('/checkout', isLoggedIn, function(req, res, next){
  if (!req.session.cart){
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  console.log(cart);
  cart.reduceInventory();

  var stripe = require("stripe")(
    "sk_test_NGDiDCBCL8KqyMYGhZQHErPK"
  );

  stripe.charges.create({
    amount: cart.totalPrice * 100,
    currency: "usd",
    source: req.body.stripeToken, // obtained with Stripe.js
    description: "Test Charge"
  }, function(err, charge) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }

    var order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
      paymentId: charge.id
    });
    order.save(function(err, result){
      console.log(err);
      req.flash('success', "Success! You're hype AF");
      req.session.cart = null;
      res.redirect('/shop');
      });
   });
});

router.get('/other/privacy', function(req, res, next){
  res.render('other/privacy', {showShop: true});
});


module.exports = router;

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }

  req.session.oldUrl =  req.url;
  res.redirect('/user/signin');
};
