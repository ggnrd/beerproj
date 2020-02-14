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
var TEMP = require('../models/TEMP');
var User = require('../models/user');
var order = require('../models/order');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var url = require('url').URL;
var bcrypt = require('bcryptjs');

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



function getDocument(options) {
  return new Promise(resolve => {
    resolve(mLab.viewDocument(options));
  })
}


async function msg(options) {
  try {
    var b = await getDocument(options);
    // console.log(" wait? good from the async func  🤡" +JSON.stringify( b.data));
    return b;
  } catch (err) {
    console.log('bad   from the async func ' + err);
  }

}



function UpdateUserToORdersTrue(id) {
  console.log(id);

  var options = {
    database: 'beer',
    collection: 'users',
    id: id,
    query: {
      "userId": id,
      "$oid": id

    },
    updateObject: {
      orders: true
    }
  };

  mLab.viewDocument(options)
    .then(function (response) {
      response.data.orders = true;
      var options = {
        database: 'beer',
        collection: 'users',
        id: response.data._id.$oid,
        updateObject: response.data
      };
      mLab.updateDocument(options)
        .then(function (response) {
          return true
        })
        .catch(function (error) {
          console.log('error', error)
        });
    })
    .catch(function (error) {
      console.log('error', error)
    });

}

function DefultParamsObjects(params) {
  Object.entries(params._doc).forEach(([key, val]) => {
    console.log("  _doc  ==> " + key + "   val ==>  " + val); // the name of the current key.
    if (key == "ZipCode" || key == "cardCVC") {
      if (val == undefined) {
        val = 0;
        params._doc[key] = 0;
      }
    } else {
      if (val == undefined) params._doc[key] = "";

    }

  });
  console.log("params  ===> " + params);


  return params;


}

function isBlogExits(blog) {

  //get all blogs to the var blogs
  var options = {
    database: 'beer', //optional 
    collection: 'blogs'
  };

  mLab.listDocuments(options, Email)
    .then(function (response, Email) {
      blogs = response.data;
      Email = req.body.Email;



      return results = blogs.some(({
        email
      }) => email == Email);



    })
    .catch(function (error) {
      console.log('error', error)
    });


}

function return10chars() {

  return this.substring(0, 9);

}


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
var userId = "";
var BlogId = "";
var orderId = "";

//return true if this is the admin
function isAdmin(req) {
  //cookie chack 
  try {
    if (req.session.passport == undefined && req.cookies.rememberme == undefined) {
      return false
    }

    if (req.session.passport.user == process.env.admin_KEY_USER) {
      console.log('1req.session.passport == admin   ');
      adminby = 'session';
      return true;
    } else {
      return false
    }
  } catch (error) {
    console.log('error', error.massge);
    return false
  }


}
// blog = 1 order = 0
function sendMail(Email, whatTOsend) {

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
    text: whatTOsend.text, // plain text body
    html: whatTOsend.html // html body
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

// Get Homepage
// http://localhost:3000/
router.get('/', function (req, res) {
  res.render('index');
});

////////////////gets all info from DB!
router.get('/users/admin/hompage', function (req, res) {
  var backPage = '/admin';
  if (isAdmin(req) == false) {
    if (req.session.passport == undefined) {
      req.flash('error', 'you Are NOT logged in ');
      return res.redirect('/admin');
    }

    if (req.session.passport.user != process.env.admin_KEY_USER) {
      req.flash('error', 'you are not allowed because you are not an admin');
      return res.redirect('/admin');
    }
  }

  var adminby, blogs, users, orders, success_msg, time;
  //get all users to the var users

  var options = {
    database: 'beer',
    collection: 'BEER_TEMP'
  };
  mLab.listDocuments(options)
    .then(function (response) {
      //console.log('time is',response.data);
      time = response.data;
    })
    .catch(function (error) {
      console.log('error', error)
    });


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

      Object.keys(response.data).forEach(function (password) {
        users[password].password = response.data[password].password.substring(0, 9) + ".....";
      });

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
      orders = response.data
      //  console.log('orders', orders)
      Object.keys(response.data).forEach(function (cardNumber) {
        orders[cardNumber].cardNumber = response.data[cardNumber].cardNumber.substring(0, 9) + ".....";
      });
    })

    .catch(function (error) {
      console.log('error', error)
    });

  ////// this is how to save a cookie  for 15 min
  res.cookie('rememberme', process.env.admin_KEY_USER, {
    expires: new Date(Date.now() + 900000),
    httpOnly: true
  });



  //send flash and then rediract with some data
  // setTimeout(function () {
  if (adminby == 'cookies') {
    var success_msg = req.flash('success_msg', "admin by cookies");
    var success_msg = req.flash('success_msg');
  } else {
    var success_msg = req.flash('success_msg', "admin by session");
    var success_msg = req.flash('success_msg');
  }
  // // }, 1000);

  // rander and send it to the HTML
  setTimeout(function () {
    res.render('admin_homepage', {
      allBlogs: blogs,
      allUsers: users,
      success_msg: success_msg[0],
      allOrders: orders,
      time: time
    });

  }, 3000);

  ////////////// done

});
router.get('/admin/hompage', function (req, res) {
  res.render('admin_homepage');
});

// http://localhost:3000/admin
router.get('/admin', function (req, res) {
  if (isAdmin(req) == true) {
    res.redirect('/users/admin/hompage');

  } else {
    res.render('admin');
  }

});

router.post('/postEmail', function (req, res) {

for (let index = 0; index < 5; index++) {
   var options = {
    database: 'beer',
    collection: 'BEER_TEMP',
    data:[{
      TEMP: Math.floor((Math.random() * 80) + 10),
      date: new Date().toLocaleString()
    }] 
  };

  mLab.insertDocuments(options)
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log('error', error)
    });

}
 







  // Register User/ http://localhost:3000/user/register   send to DB 
  var Email = req.body.Email;
  var date = new Date().toLocaleString();
  var results;
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



    //get all blogs to the var blogs
    var options = {
      database: 'beer', //optional 
      collection: 'blogs'
    };

    mLab.listDocuments(options, Email)
      .then(function (response, Email) {
        blogs = response.data;
        Email = req.body.Email;

        try {
          results = blogs.some(({
            email
          }) => email == Email);


        } catch (error) {
          console.log(error);
        }
      }).then(function (response) {


        if (!results) {
          blog.createBlog(newBlog);
          // need yo show a massege 
          var whatTOsend = {
            text: "Your Oreder was sucsseefuly sent",
            html: "<h1>We got your order and we are starting to deliver it</h1>"
          }
          sendMail(newBlog.email, whatTOsend);
        }
        setTimeout(function () {
          res.redirect('/')
        }, 7000);


      })
      .catch(function (error) {
        console.log('error', error)
      });




  }


});


router.get('/users/account/', function (req, res) {
  if (req.isUnauthenticated()) {
    res.redirect('./')
  }
  res.render('account');
  /////res.render('UpdateUser');

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
        res.redirect('/users/admin/hompage');
      })
      .catch(function (error) {
        console.log('error', error)
      });
  }
  req.flash('error', 'cant Delete this User ');
  return res.redirect('/users/admin/hompage');

});

////////// get to the page to enter the ner detail
router.post('/PreeUpdateUser', function (req, res) {
  if (req.body.id == process.env.admin_KEY_USER) {
    req.flash('error', 'cant Update this User ');
    res.redirect('/users/admin/hompage');
  }
  userId = req.body.id;
  res.render('UpdateUser');

});


////////// get to the page to enter the ner detail
router.get('/PreeUpdateUser', function (req, res) {
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
  if (userId == undefined) {
    userId = req.body.user;
  }

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

  options.updateObject.password = bcrypt.hashSync(options.updateObject.password, 10);
  // User.HashUser(options);

  UpdateUserButwontCahngeAdminUser(options);

  if (options.id == process.env.admin_KEY_USER) {
    res.redirect('/users/admin/hompage');
  } else {
    res.redirect('/users/account/');
  }


});

////////// get to the page to enter the ner detail
router.post('/PreeUpdateBlog', function (req, res) {
  BlogId = req.body.id;
  res.render('UpdateBlog');
});

////////////// blogs
router.post('/UpdateBlog', function (req, res) {

  var email = req.body.email;
  var BlogDate = new Date().toLocaleString();
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
      res.redirect('users/admin/hompage');

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
      res.redirect('/users/admin/hompage');

    })
    .catch(function (error) {
      console.log('error', error)
    });

});

// http://localhost:3000/unsubscribe
router.get('/unsubscribe*', function (req, res) {
  var email = req.param('email');
  if (req.query.id != "null") {
    console.log("Email=  " + email + "    id=" + req.query.id + "");
    var options = {
      database: 'beer',
      collection: 'blogs',
      id: req.query.id
    };


    mLab.deleteDocument(options)
      .then(function (response) {
        console.log("susccesd)");
        req.flash('success_msg', 'you are not subscribed ');
        res.redirect('/');
      })
      .catch(function (error) {
        console.log('error', error)
      });

  } else {
    res.render('unsubscribe', {
      url: email
    });
  }
});

// http://localhost:3000/unsubscribeToMlab
router.post('/unsubscribeToMlab', function (req, res) {
  var EmailToDelete = req.body.Url;
  var IdofEmailToDelete = "0";
  var options = {
    database: 'beer',
    collection: 'blogs',
    email: req.body.Url
  };
  IdofEmailToDelete = mLab.listDocuments(options)
    .then(function (response) {
      for (let index = 0; index < response.data.length; index++) {
        if (response.data[index].email == req.body.Url) {
          IdofEmailToDelete = response.data[index]._id.$oid;
          res.redirect("/unsubscribe/?email=" + response.data[index].email + "&id=" + IdofEmailToDelete);
        } else if (response.data.length - 1 == index) {
          console.log("Somthing is Worng - no email has ben found");
          return res.redirect('/');
        }
      }
    }).catch(function (error) {
      console.log('error', error)
    });
});





////////    Order 
router.post('/accounts', function (req, res) {
  if (req.isUnauthenticated()) {
    throw err;
  }

  if (req.checkBody('cardCVC', 'Only 3 Numbers').length == 3) {
    // console.log("good  cvc");
  }
  var err = req.validationErrors();
  if (err) {
    console.log(err);
    req.body.order.CVC = 000;
  }


  var orderDate = new Date().toLocaleString();
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
    cardCVC: req.body.order.CVC,
    Date: orderDate,
    userId: req.user.id

  });
  newOrder = DefultParamsObjects(newOrder);
  // console.log("newOrder ==> ", newOrder);
  UpdateUserToORdersTrue(newOrder.userId);
  order.createOrder(newOrder);
  var whatTOsend = {
    text: "thanks for joinning our Beer Blog?",
    html: "<h1>this is the BEER Blog !!!</h1> <br><a href='localhost:3000/unsubscribe/?email=' " + req.body.order.Email + "'&id=null'>unsubscribe</a>"
  }


  sendMail(req.body.order.Email, whatTOsend);
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
      if (isAdmin(req)) {
        res.redirect('/users/admin/hompage');

      } else {
        res.redirect('/users/UserMainPage');

      }
    })
    .catch(function (error) {
      console.log('error', error)
    });
});

////////// get to the page to enter the ner detail
router.post('/PreeUpdateorder', function (req, res) {
  orderId = req.body.id;
  orderId = req.body.id;
  res.render('Updateorder', {
    orderId: orderId
  });
  // res.render('Updateorder',orderId);

});
router.get('/PreeUpdateorder', function (req, res) {
  orderId = req.body.id;
  orderId = req.body.id;

  res.render('Updateorder');

});
router.post('/UpdateOrder', async function (req, res) {
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
  ChangedAT = ChangedAT.toLocaleString();
  var Address = req.body.Address;


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
  var options1 = {
    database: 'beer',
    collection: 'orders',
    id: req.body.orderid
  };

  var oldOrder = await msg(options1);
  let x = {
    ...options.updateObject,
    ...oldOrder.data
  };
  x.Date = new Date().toLocaleString();

  for (const key in options.updateObject) {
    if (options.updateObject[key] == undefined) {
      options.updateObject[key] = "";
    }
    if (undefined == oldOrder.data[key]) {
      oldOrder.data[key] = "";
    }

    if (options.updateObject[key] == "") {
      options.updateObject[key] = oldOrder.data[key];

    }
  }


  options.updateObject.Date = new Date().toLocaleString();

  order.HashOrder(options);
  setTimeout(function () {
    if (options.id == undefined) {
      req.flash('error', 'This user do not own orders');
      res.redirect('/PreeUpdateorder');
    } else {
      mLab.updateDocument(options)
        .then(function (response) {
          if (isAdmin(req)) {
            res.redirect('/admin');
          } else {
            res.redirect('/users/UserMainPage');

          }
        })
        .catch(function (error) {
          console.log('error', error);
          req.flash('error', error);
          res.redirect('/users/UserMainPage');

        });
    }
  }, 10000);
});

router.post('/sendNewBlogFORall', function (req, res) {

  //get all blogs to the var blogs
  var options = {
    database: 'beer', //optional 
    collection: 'blogs'
  };

  mLab.listDocuments(options)
    .then(function (response) {
      var whatTOsend = {
        text: req.body.title, //"new  title ",
        html: req.body.text
      }
      blogs = response.data;

      Object.keys(response.data).forEach(function (email) {

        console.log(email, response.data[email].email);
        sendMail(response.data[email].email, whatTOsend);
      });

    })
    .catch(function (error) {
      console.log('error', error)
    });

  // req.flash.
  res.redirect('/users/admin/hompage');
});




function sendTempData() {
  setInterval(() => {
    var i = 0;
    var newTemp = {
      TEMP: Math.floor((Math.random() * 80) + 10),
      date: new Date().toLocaleString(),
    };
    TEMP.createTEMP(newTemp, function (err, newTemp) {
      if (err) throw err;
      console.log("Number + " + i + "==>   ", newTemp);
    });

  }, 1000);
}

module.exports = router;