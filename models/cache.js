const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CacheSchema = new Schema({
    currentid     : {type : String},
    userid        : {type : String},
    step          : {type : Number},
    state         : {type : Boolean,default : false},
    created       : {type : Date ,default : Date.now()}
});

module.exports = mongoose.model("Cache",CacheSchema);