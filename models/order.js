var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var OrderSchema = mongoose.Schema({
  liter: {
    type: String,
    index: true
  },
  matireal: {
    type: String
  },
  Filter: {
    type: String
  },
  Spices: {
    type: String
  },
  alco: {
    type: String
  },
  pakege: {
    type: String
  },
  textarea: {
    type: String
  },
  Fname: {
    type: String
  },
  Lname: {
    type: String
  },
  email: {
    type: String
  },
  Address: {
    type: String
  },
  City: {
    type: String
  },
  State: {
    type: String
  },
  ZipCode: {
    type: Number
  },
  cardNumber: {
    type: String
  },
  cardCVC: {
    type: Number
  },
  cardExpiry: {
    type: String
  },
  couponCode: {
    type: String
  },
  Date: {
    type: String
  },
  userId: {
    type: String
  }

});



var Order = module.exports = mongoose.model('Order', OrderSchema);

module.exports.createOrder = function (newOrder, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(newOrder.cardNumber, salt, function (err, hash) {
      newOrder.cardNumber = hash;
      //console.log("newOrder  ==>   ",newOrder);
      newOrder.save(callback);
    });
  });

  newOrder.save(newOrder);
}


module.exports.HashOrder = function (options, callback) {
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(options.updateObject.cardNumber, salt, function (err, hash) {
      console.log("options.updateObject.cardNumber  (Befor hash) ==>   ", options.updateObject.cardNumber);
      options.updateObject.cardNumber = hash;
      console.log("options.updateObject.cardNumber (After hash)  ==>   ", options.updateObject.cardNumber);
    });
  });



}