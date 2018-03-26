var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var MLab = require('mlab-data-api');


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

// Register--// http://localhost:3000/user/register

router.get('/register', function (req, res) {
  res.render('register');
});

// Login// http://localhost:3000/user/login
router.get('/login', function (req, res) {
  res.render('login');
});
// enter to admin portal // http://localhost:3000/users/admin/hompage - need to make only Logged in admin can get into this URL
router.get('/admin/hompage', function (req, res) {
      /// use sessioin to make sure only admin can get to this URL
      if (req.session.passport == undefined) {
         	     req.flash('error', 'you Are NOT logged in ');
         	     return res.redirect('/admin');}
     	   if (req.session.passport.user != process.env.admin_KEY_USER) {
       		  	 req.flash('error', 'you are not allowed because you are not an admin');
       		 	  return res.redirect('/admin');
        }



        var options = {
          database: 'beer', //optional 
          collection: 'blogs'
        };

        mLab.listDocuments(options)
          .then(function (response) {
            // console.log('blogs === >',response.data)
          })
          .catch(function (error) {
            console.log('error', error)
          });
        ////////////// done

        ////////////////gets all users!

        var options = {
          database: 'beer', //optional 
          collection: 'users'
        };

        mLab.listDocuments(options)
          .then(function (response) {
            // console.log('users === >',response.data)
          })
          .catch(function (error) {
            console.log('error', error)
          });
        res.render('admin_homepage');
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

        req.flash('success_msg', 'You are registered and can now login');

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
                message: 'Invalid password'
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
    /////





    router.get('/logout', function (req, res) {
      req.logout();
      res.redirect('/users/login');
    });

    module.exports = router;
