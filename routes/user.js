var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');


var Order = require('../models/order');
var Cart = require('../models/cart');

var csrfProtection = csrf();
router.use(csrfProtection);

/**Must be logged in to see the profile page**/
router.get('/profile', isLoggedIn, function(req, res, next){
  Order.find({user: req.user}, function(err, orders){
    if(err){
      return res.write('Error');
    }
    var cart;
    orders.forEach(function(order) {
      cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });

    res.render('user/profile',{orders: orders, showHeader: true, showHeader: true});

  });
});

router.get('/logout', function(req, res, next){
  req.logout();
  res.redirect('/');
});

/**All routes below are checked for "not logged in"**/
router.use('/', notLoggedIn, function(req, res, next){
  next();
});

router.get('/signup', function(req, res, next){
  var messages = req.flash('error');
  res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0, showHeader: true});
});

router.post('/signup', passport.authenticate('local.signup', {
  successRedirect: '/user/profile',
  failureRedirect: '/user/signup',
  failureFlash: true
}), function(req, res, next){
      if(req.session.oldUrl){
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
      } else {
        res.redirect('user/profile');
      }
    });

router.get('/signin', function(req, res, next){
  var messages = req.flash('error');
  res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0, showHeader: true});
});

router.post('/signin', passport.authenticate('local.signin', {
  failureRedirect: '/user/signin',
  failureFlash: true
}), function(req, res, next){
      if(req.session.oldUrl){
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
      } else {
        res.redirect('user/profile');
      }
    });



module.exports = router;

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

function notLoggedIn(req, res, next){
  if(!req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}
