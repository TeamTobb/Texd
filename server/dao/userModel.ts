var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
    username: String,
    password: String
});

Account.plugin(passportLocalMongoose);

// export = Account; 

module.exports = mongoose.model('Account', Account);

// export var account = mongoose.model("document", Account); 
