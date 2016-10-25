var Product = require('../models/product');

var mongoose = require('mongoose');
mongoose.connect('localhost:27017/shopping');

var products = [
  new Product({
  imagePath: 'http://lp.hm.com/hmprod?set=key[source],value[/model/2013/2AQ%200183002%20001%2095%203256.jpg]&set=key[rotate],value[]&set=key[width],value[]&set=key[height],value[]&set=key[x],value[]&set=key[y],value[]&set=key[type],value[STILL_LIFE_FRONT]&hmver=2&call=url[file:/product/large]',
  title: 'Top',
  description: 'available in different sizes',
  sizes: {
    small: 50,
    medium: 50,
    large: 50
  },
  price: 75
}),
new Product({
imagePath: 'http://lp.hm.com/hmprod?set=key[source],value[/model/2016/D00%200416547%20002%2089%200145.jpg]&set=key[rotate],value[]&set=key[width],value[]&set=key[height],value[]&set=key[x],value[]&set=key[y],value[]&set=key[type],value[STILL_LIFE_FRONT]&set=key[hmver],value[1]&call=url[file:/product/large]',
title: 'Bottom',
description: 'available in different sizes',
sizes: {
    small: 50,
    medium: 50,
    large: 50
  },
price: 75
})];

var done = 0;
for (var i = 0; i < products.length; i++) {
  products[i].save(function(err, result) {
    done++;
    if(done === products.length) {
      exit();
    }
  });
}

function exit() {
  mongoose.disconnect();
}
