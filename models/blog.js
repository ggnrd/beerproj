var mongoose = require('mongoose');

// User Schema
var BlogSchema = mongoose.Schema({
	email: {
		type: String,
		index:true
	},
	date: {
		type: String
	},
});

var Blog = module.exports = mongoose.model('Blog', BlogSchema);


module.exports.createBlog = function(newBlog, callback){
    
	newBlog.save(callback);
}

module.exports.getBlogByEmail = function(Email, callback){
	console.log("got into module.exports.getBlogByEmail");
	
	var query = {email: Email};		
	blog.findOne(query, callback);
}

module.exports.getBlogById = function(id, callback){
	blog.findById(id, callback);
}


