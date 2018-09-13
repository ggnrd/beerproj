var express = require('express');
var router = express.Router();
var dotenv = require('dotenv').config();

var bodyParser = require('body-parser');
var MLab = require('mlab-data-api');
var nodemailer = require('nodemailer');

var urlencodedParser = bodyParser.urlencoded({
  extended: false
});

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var blog = require('../models/blog');
var User = require('../models/user');
var order = require('../models/order');

// Get Homepage
// http://localhost:3000/
router.get('/', function (req, res) {
  res.render('index');
});

// initialize  the Mlab API
var mLab = MLab({
  key: process.env.mongo_mlabKey,
  host: 'https://api.mlab.com', //optional 
  uri: '/api', //optional 
  version: '1', //optional 
  database: 'your working database', //optional 
  timeout: 10000 //optional 
})
///////////////////////////


////////////////gets all info from DB!
router.get('/users/admin/hompage', function (req, res) {
  var backPage = '/admin';
  if (req.session.passport == undefined) {
    req.flash('error', 'you Are NOT logged in ');
    return res.redirect('/admin');
  }

  if (req.session.passport.user != process.env.admin_KEY_USER) {
    req.flash('error', 'you are not allowed because you are not an admin');
    return res.redirect('/admin');
  }
  var blogs;
  var users;
  var orders;
  
//get all blogs to the var blogs
  var options = {
    database: 'beer', //optional 
    collection: 'blogs'
  };
 
  mLab.listDocuments(options)
    .then(function (response) {
        blogs = response.data;
    })
    .catch(function (error) {
      console.log('error', error)
    });


//get all users to the var users

  var options = {
    database: 'beer',
    collection: 'users'
  };
  mLab.listDocuments(options)
    .then(function (response) {
      users = response.data;
    })
    .catch(function (error) {
      console.log('error', error)
    });


  //get all orders to the var orders

  var options = {
    database: 'beer',
    collection: 'orders'
  };

  mLab.listDocuments(options)
    .then(function (response) {
      orders = response.data  })

    .catch(function (error) {
      console.log('error', error)
    });

    // rander and send it to the HTML

  setTimeout(function () {
    res.render('admin_homepage', {
      allBlogs: blogs,
      allUsers: users,
      allOrders: orders
    });

  }, 3000);

  ////////////// done

});

// http://localhost:3000/admin
router.get('/admin', function (req, res) {
  
  res.render('admin');
});

router.post('/postEmail', function (req, res) {


  // Register User/ http://localhost:3000/user/register   send to DB 
  var Email = req.body.Email;
  var date = new Date();

  // Validation
  req.checkBody('Email', 'Email is required').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    res.redirect('/', {
      errors: errors
    });

    console.log(errors);

  } else {
    var newBlog = new blog({
      email: Email,
      date: date
    });

    blog.createBlog(newBlog);
    // need yo show a massege 
    res.redirect('/');
  }

  nodemailer.createTestAccount((err, account) => {
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.email_USER, // generated  user
        pass: process.env.email_Pass // generated  password
      }
    });

    // setup email data with unicode symbols
    let mailOptions = {
      from: '"Beer Project" <' + process.env.email_USER + '>', // sender address
      to: Email, // list of receivers
      subject: 'Beer Blog ✔', // Subject line
      text: 'thanks for joinning our Beer Blog?', // plain text body
      html: '<h1>this is the BEER Blog !!!</h1>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        console.log('Email address: ' + mailOptions.to);

      }
    });

  });


});

router.post('/deleteUser', function (req, res) {
  var options = {
    database: 'beer',
    collection: 'users',
    id: req.body.id
  };
  if (options.id != process.env.admin_KEY_USER) {
    mLab.deleteDocument(options)
      .then(function (response) {
        res.redirect('/users/admin/users');
      })
      .catch(function (error) {
        console.log('error', error)
      });
  }
  req.flash('error', 'cant Delete this User ');
  return res.redirect('/users/admin/users');

});


var userId = "";

////////// get to the page to enter the ner detail
router.post('/PreeUpdateUser', function (req, res) {
  if (req.body.id == process.env.admin_KEY_USER) {
    req.flash('error', 'cant Update this User ');
    res.redirect('/users/admin/hompage');
  }
  userId = req.body.id;
  res.render('UpdateUser');

});


router.post('/UpdateUser', function (req, res) {
  var name = req.body.name;
  var LastName = req.body.LastName;
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var password1 = req.body.password1;

  // Validation
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password1', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();


  var options = {
    database: 'beer',
    collection: 'users',
    id: userId,
    updateObject: {
      name: name,
      LastName: LastName,
      username: username,
      email: email,
      password: password,
      password1: password1
    }
  };



  User.HashUser(options);


  setTimeout(function () {
    mLab.updateDocument(options)
      .then(function (response) {
        res.redirect('/users/admin/hompage');

      })
      .catch(function (error) {
        console.log('error', error)
      });
  }, 1000);

});

var BlogId = "";


////////// get to the page to enter the ner detail
router.post('/PreeUpdateBlog', function (req, res) {
  BlogId = req.body.id;
  //   BlogDate = new Date();
  //   BlogDate.toString(BlogDate);

  res.render('UpdateBlog');

});

////////////// blogs
router.post('/UpdateBlog', function (req, res) {

  var email = req.body.email;
  var BlogDate = new Date();
  console.log("BlogDate ==> ", BlogDate);

  // Validation
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();

  var errors = req.validationErrors();



  var options = {
    database: 'beer',
    collection: 'blogs',
    id: BlogId,
    updateObject: {
      email: email,
      date: BlogDate
    }
  };


  mLab.updateDocument(options)
    .then(function (response) {
      res.redirect('/users/admin/blogs');

    })
    .catch(function (error) {
      console.log('error', error)
    });


});


router.post('/deleteBlog', function (req, res) {
  var options = {
    database: 'beer',
    collection: 'blogs',
    id: req.body.id
  };

  mLab.deleteDocument(options)
    .then(function (response) {
      res.redirect('/users/admin/blogs');

    })
    .catch(function (error) {
      console.log('error', error)
    });

});

////////    Order 
router.post('/accounts', function (req, res) {
  console.log(req.body);


  req.checkBody('cardCVC', 'Only 3 Numbers').len(3, 3);
  var err = req.validationErrors();
  if (err) {
    console.log(err);

  }



  var orderDate = new Date();
  var newOrder = new order({
    email: req.body.order.Email,
    liter: req.body.order.liter,
    matireal: req.body.order.matireal,
    Filter: req.body.order.Filter,
    Spices: req.body.order.Spices,
    alco: req.body.order.alco,
    pakege: req.body.order.pakege,
    textarea: req.body.order.textarea,
    Fname: req.body.order.Fname,
    Lname: req.body.order.Lname,
    Address: req.body.order.Address,
    City: req.body.order.City,
    State: req.body.order.State,
    ZipCode: req.body.order.ZipCode,
    cardNumber: req.body.order.cardNumber,
    cardExpiry: req.body.order.cardExpiry,
    couponCode: req.body.order.couponCode,
    CVC: req.body.order.cardCVC,
    Date: orderDate
  });

  console.log("newOrder ==> ", newOrder);

  order.createOrder(newOrder);

  nodemailer.createTestAccount((err, account) => {
    let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.email_USER, // generated  user
        pass: process.env.email_Pass // generated  password
      }
    });

    // setup email data with unicode symbols
    let mailOptions = {
      from: '"Beer Project" <' + process.env.email_USER + '>', // sender address
      to: newOrder.Email, // list of receivers
      subject: 'Beer Order ✔', // Subject line
      text: 'Your Oreder was sucsseefuly sent ', // plain text body
      html: '<h1>We got your order and we are starting to deliver it</h1>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        console.log('Email address: ' + mailOptions.to);

      }
    });

  });
  return true;



});




router.post('/deleteOrder', function (req, res) {
  var options = {
    database: 'beer',
    collection: 'orders',
    id: req.body.id
  };
  mLab.deleteDocument(options)
    .then(function (response) {
      res.redirect('/users/admin/orders');
    })
    .catch(function (error) {
      console.log('error', error)
    });
});


////////// get to the page to enter the ner detail
router.post('/PreeUpdateorder', function (req, res) {
  orderId = req.body.id;
  res.render('Updateorder');

});

var orderId = "";

router.post('/UpdateOrder', function (req, res) {
  var email = req.body.email;
  var liter = req.body.group2;
  var matireal = req.body.group8;
  var Filter = req.body.Filter;
  var Spices = req.body.Spices;
  var alco = req.body.group4;
  var pakege = req.body.group1;
  var textarea = req.body.textarea;
  var Fname = req.body.Fname;
  var Lname = req.body.Lname;
  var City = req.body.City;
  var State = req.body.State;
  var ZipCode = req.body.ZipCode;
  var cardNumber = req.body.cardNumber;
  var cardExpiry = req.body.cardExpiry;
  var couponCode = req.body.couponCode;
  var ChangedAT = new Date();
  var Address = req.body.Address;

  // // Validation
  // req.checkBody('name', 'Name is required').notEmpty();
  // req.checkBody('email', 'Email is required').notEmpty();
  // req.checkBody('email', 'Email is not valid').isEmail();
  // req.checkBody('username', 'Username is required').notEmpty();
  // req.checkBody('password', 'Password is required').notEmpty();
  // req.checkBody('password1', 'Passwords do not match').equals(req.body.password);

  // var errors = req.validationErrors();


  var options = {
    database: 'beer',
    collection: 'orders',
    id: orderId,
    updateObject: {
      email: email,
      liter: liter,
      matireal: matireal,
      Filter: Filter,
      Spices: Spices,
      alco: alco,
      pakege: pakege,
      textarea: textarea,
      Fname: Fname,
      Lname: Lname,
      City: City,
      State: State,
      ZipCode: ZipCode,
      cardNumber: cardNumber,
      cardExpiry: cardExpiry,
      couponCode: couponCode,
      Date: ChangedAT,
      Address: Address
    }
  };
  order.HashOrder(options);
  setTimeout(function () {
    mLab.updateDocument(options)
      .then(function (response) {
        res.redirect('/users/admin/orders');

      })
      .catch(function (error) {
        console.log('error', error)
      });
  }, 10000);


});
module.exports = router;
