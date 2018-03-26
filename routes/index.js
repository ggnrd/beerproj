var express = require('express');
var router = express.Router();
var dotenv =require('dotenv').config();

var bodyParser = require('body-parser');
var MLab = require('mlab-data-api');
var nodemailer = require('nodemailer');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var blog = require('../models/blog');
var User = require('../models/user');


// Get Homepage
// http://localhost:3000/
router.get('/', function (req, res) {	 
	res.render('index');
});

// initialize  the Mlab API
var mLab = MLab({
	key: process.env.mongo_mlabKey,
	host: 'https://api.mlab.com', //optional 
	uri: '/api',//optional 
	version: '1',//optional 
	database: 'your working database', //optional 
	timeout: 10000 //optional 
})
///////////////////////////


////////////////gets all blogs!
router.get('/users/admin/blogs', function (req, res) {

	var options = {
		database: 'beer', //optional 
		collection: 'blogs'
	};

	mLab.listDocuments(options)
		.then(function (response) {
			//   console.log('blogs === >',response.data) full blogs arry
			res.render('admin_homepage', {
				allBlogs: response.data

			});
		})
		.catch(function (error) {
			console.log('error', error)
		});
	////////////// done


});



router.get('/users/admin/users', function (req, res) {

	////////////////gets all users!

	var options = {
		database: 'beer',
		collection: 'users'
	};

	mLab.listDocuments(options)
		.then(function (response) {
			//   console.log('users === >',response.data)    full users arry
			res.render('admin_homepage', {
				allUsers: response.data
			});
		})
		.catch(function (error) {
			console.log('error', error)
		});

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
			from: '"Beer Project" <'+process.env.email_USER+'>', // sender address
			to: Email, // list of receivers
			subject: 'Beer Blog ✔', // Subject line
			text: 'thanks for joinning our Beer Blog?', // plain text body
			html: '<h1>this is the BEER Blog !!!</h1>' // html body
		};
	
		// send mail with defined transport object
		  transporter.sendMail(mailOptions, function(error, info){
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
	mLab.deleteDocument(options)
		.then(function (response) {
			res.redirect('/users/admin/users');
		})
		.catch(function (error) {
			console.log('error', error)
		});
});


var userId = "";

////////// get to the page to enter the ner detail
router.post('/PreeUpdateUser', function (req, res) {
	userId = req.body.id;
	res.render('Updateuser');

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


	mLab.updateDocument(options)
		.then(function (response) {
			res.redirect('/users/admin/users');

		})
		.catch(function (error) {
			console.log('error', error)
		});

});

var BlogId = "", BlogDate = "";


////////// get to the page to enter the ner detail
router.post('/PreeUpdateBlog', function (req, res) {
	BlogId = req.body.id;
	BlogDate = new Date();
	BlogDate.toString(BlogDate);

	res.render('Updateblog');

});

////////////// blogs
router.post('/UpdateBlog', function (req, res) {

	var email = req.body.email;


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








module.exports = router;