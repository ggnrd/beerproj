var mongoose = require('mongoose');

// TEMP Schema
var TEMPSchema = mongoose.Schema({
	TEMP: {
		type: Number,
	},
	date: {
		type: String
	},
});

var TEMP = module.exports = mongoose.model('TEMP', TEMPSchema);


module.exports.createTEMP = function(TEMP, callback){
	
	TEMP.save(callback);

	TEMP.save(TEMP);
}
module.exports.createBlog = function(newBlog, callback){
    
	newBlog.save(callback);
}


module.exports.getTEMPById = function(id, callback){
	TEMP.findById(id, callback);
}


