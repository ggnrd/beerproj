var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var MLab = require('mlab-data-api');
var nodemailer = require('nodemailer');


// initialize  the Mlab API
var mLab = MLab({
  key: process.env.mongo_mlabKey,
  host: 'https://api.mlab.com', //optional 
  uri: '/api', //optional 
  version: '1', //optional 
  database: 'your working database', //optional 
  timeout: 10000 //optional 
})
// Login// http://localhost:3000/user/login
router.get('/login', function (req, res) {
  res.render('login');
});

// Register--// http://localhost:3000/user/register
router.get('/register', function (req, res) {
  res.render('register');
});

// Register User/ http://localhost:3000/user/register   send to DB 
router.post('/register', function (req, res) {
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

  if (errors) {
    res.render('register', {
      errors: errors
    });
  } else {
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password
    });

    User.createUser(newUser, function (err, user) {
      if (err) throw err;
      console.log(user);
    });

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
      to: email, // list of receivers
      subject: 'New User ! ', // Subject line
      html: '<h1>You have created a new uesr !</h1> <h1>Username : ' + username + ' </h1>' // html body
    };
    // send mail with defined transport object  
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        req.flash('success_msg', 'You are registered and can now login BUT soming is worng with your Email');
      } else {
        console.log('Email sent: ' + info.response);
        console.log('Email address: ' + mailOptions.to);
        req.flash('success_msg', 'You are registered and can now login');

      }
    });
    res.redirect('/users/login');
  }
});

passport.use(new LocalStrategy(
  function (username, password, done) {
    User.getUserByUsername(username, function (err, user) {
      if (err) throw err;

      if (!user) {
        return done(null, false, {
          message: 'Unknown User'
        });
      }

      User.comparePassword(password, user.password, function (err, isMatch) {
        if (err) throw err;
        if (isMatch) {

          if (user.username == process.env.admin) { // all most a complite admin validation
            console.log("this is an admin");
            return done(null, user);
          }
          return done(null, user);
        } else {
          return done(null, false, {
            message: 'Somthing is wrong '
          });
        }
      });
    });
  }));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  }),
  function (req, res) {
    res.redirect('/');
  });
/// get to the admin page after authenticate the admin user
router.post('/loginadmin',
  passport.authenticate('local', {
    successRedirect: '/users/admin/hompage',
    failureRedirect: '/admin',
    failureFlash: true
  }),
  function (req, res) {

    res.redirect('/users/admin/hompage');

  });
///
router.get('/logout', function (req, res) {
  res.clearCookie("rememberme");
  req.logout();
  res.redirect('/users/login');
});

module.exports = router;
