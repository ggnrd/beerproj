var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var MLab = require('mlab-data-api');
var nodemailer = require('nodemailer');
var bcrypt = require('bcryptjs');


// initialize  the Mlab API
var mLab = MLab({
  key: process.env.mongo_mlabKey,
  host: 'https://api.mlab.com', //optional 
  uri: '/api', //optional 
  version: '1', //optional 
  database: 'your working database', //optional 
  timeout: 10000 //optional 
})


// Email  string mmail address,x new pass to the user
function sendMail(Email, x) {
  //  var x= Math.floor((Math.random() * 100000000) + 1);
  text = 'forgot your password?   no problem....';
  html = '<h1>forgot your password?   no problem....</h1> \n this is your new passs : ' + x + '<br><a href="localhost:3000/users/login">log in</a>';

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
    subject: 'forgot password ✔', // Subject line
    text: text, // plain text body
    html: html // html body
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

};

function UpdateUserButwontCahngeAdminUser(options) {
  if (options.id == process.env.admin_KEY_USER || options.updateObject.username == process.env.admin) {
    console.log("cant change admin user");
    return options
  } else {
    setTimeout(function () {
      mLab.updateDocument(options)
        .then(function (response) {
          console.log("User Update Sucssesfuly");

          return options
        })
        .catch(function (error) {
          console.log('error', error)
          return options
        });
    }, 1000);
  }

}

function UpdateUserToORdersTrue(id) {

  var options = {
    database: 'beer',
    collection: 'users',
    id: id,
    updateObject: {
      orders: true
    }
  };

  mLab.updateDocument(options)
    .then(function (response) {})
    .catch(function (error) {
      console.log('error', error)
    });
}



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
  if (req.isUnauthenticated()) {
    res.redirect('./')
  }
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
      password: password,
      userCreateAt: new Date(),
      orders: false
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
//get to uesr homepage  include order infoo    need to connect order to the user than disp the order by user
router.get('/UserMainPage', function (req, res) {
  if (req.isUnauthenticated()) {
    res.redirect('./')
  }
  //get all orders to the var orders
  var orders = '',
    user, Dateshort;
  try {
    var options = {
      database: 'beer',
      collection: 'orders',
      query: {
        "userId": res.locals.user.id
      }
    };
  } catch (e) {
    console.log(e);
    res.redirect('/');

  };







  mLab.listDocuments(options)
    .then(function (response) {
      orders = response.data
      // console.log('orders', orders);
      for (let index = 0; index < orders.length; index++) {
        Dateshort = orders[index].Date.split("GMT");
        orders[index].Date = Dateshort[0];
        orders[index].cardNumber = orders[index].cardNumber.substring(0, 10) + "...";
      }
    })

    .catch(function (error) {
      console.log('error', error)
    });

  // var options = {
  //   database: 'beer',
  //   collection: 'users',
  //   findOne: false
  // };
  // mLab.listDocuments(options)
  // .then(function (response) {
  //   user = response.data
  //   //console.log('user',user);

  // })

  // .catch(function (error) {
  //   console.log('error', error)
  // });
  setTimeout(function () {
    res.render('UserMainPage', {
      allOrders: orders,
//lasDate:orders[0].Date
    });


  }, 3000);
});

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
    successRedirect: '/users/UserMainPage',
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


router.get('/resetpass', function (req, res) {

  res.render('forgotpassword');
});
router.post('/postresetpass', function (req, res) {

  try {
    var options = {
      database: 'beer',
      collection: 'users',
      query: {
        "email": req.body.email
      }
    };
  } catch (e) {
    console.log(e);
  };
  mLab.listDocuments(options)
    .then(function (response) {
      orders = response.data
      console.log('orders', orders);
      var x = Math.floor((Math.random() * 100000000) + 1);

      var options = {
        database: 'beer',
        collection: 'users',
        updateObject: orders

      };
      options.updateObject[0].password = x.toString();
      options.updateObject[0].password = bcrypt.hashSync(options.updateObject[0].password, 10);

      console.log(options);
      var options = {
        database: 'beer',
        collection: 'users',
        updateObject: orders[0],
        id: options.updateObject[0]._id.$oid

      };
      mLab.updateDocument(options)
        .then(function (response) {
          orders = response.data

        })
        .catch(function (error) {
          console.log('error', error)
        });
      sendMail(orders[0].email, x);
      req.flash('success_msg', "an Email was sent");
      res.redirect('/users/login');
    })

    .catch(function (error) {
      console.log('error', error)
      req.flash('error', 'Email is not exists');
    });


});



router.get('/postresetpass*', function (req, res) {
  res.render('forgotpassword');


});

module.exports = router;