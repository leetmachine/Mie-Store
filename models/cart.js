var mongoose = require('mongoose');
var Product = require('../models/product');

module.exports = function Cart(oldCart) {
  this.items = oldCart.items || {};
  this.totalQty = oldCart.totalQty || 0;
  this.totalPrice = oldCart.totalPrice || 0;
  this.shipping = oldCart.shipping || false;

  this.yesShipping = function() {
    if(!this.shipping) {
      this.totalPrice += 25;
    }
      this.shipping = true;
  }

  this.noShipping = function() {
    if(this.shipping) {
      this.totalPrice -= 25;
    }
    this.shipping = false;
  }

  this.add = function(item, id, size) {
    var storedItem = this.items[id];

    if(!storedItem) {
      storedItem = this.items[id] = {item: item, qty: 0, price: 0, size: {small: 0, medium: 0, large: 0}};
    }
    storedItem.qty++;
    storedItem.price = storedItem.item.price * storedItem.qty;
    storedItem.size[size]++;
    this.totalQty++;
    this.totalPrice += storedItem.item.price;
  };

  this.reduceByOne = function(id, size) {
    this.items[id].qty--;
    this.items[id].price -= this.items[id].item.price;
    this.items[id].size[size]--;
    this.totalQty--;
    this.totalPrice -= this.items[id].item.price;

    if (this.items[id].qty <= 0) {
      delete this.items[id];
    }
  };

  this.removeItem = function(id){
    this.totalQty -= this.items[id].qty;
    this.totalPrice -= this.items[id].price;
    delete this.items[id];
  };

  this.generateArray = function() {
    var arr= [];
    for(var id in this.items) {
        arr.push(this.items[id]);
    }
    return arr;
  };

  this.reduceInventory = function() {
    for (var id in this.items) {

      var qty = this.items[id].qty;

      Product.findById(id, function(err, product){

        product.inventory -= qty;
        product.save(function(err){
          if(err)  {
            throw err;
          }
          else {
            console.log("product updated successfully");
          };
        });
      });
    }
  };
};
