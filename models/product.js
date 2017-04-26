var mongoose = require("mongoose");
var searchPlugin = require('mongoose-search-plugin');

var Schema = mongoose.Schema;



var ProductSchema = new Schema({
 owner                :  {type : Schema.Types.ObjectId,ref :"User"},
 user                 :  {type : String},
 senderid             :  {type : String},
 coordinate           :  {type : "Point",coordinates : [0,0]},
 location             :  [],
 geocoder             :  { 
    //    address       :  {type :String},
    //     country       : {type : String},
    //     city          : {type : String},
    //     neighborhood  : {type : String},
    //     placeid       : {type : String},
    //     streetName   : {type : String},
    //     councode      : {type : String}
},
 name                 :  {type : String},
 price                :  {type : Number},
 currency             :  {type : String},
 image                :   {type : String},
 category             :   {type : String},
 description          :   {type : String},
 quantity             :   {type : Number},
 quantities           :   {type : String},
 created              :   {type : Date, default : new Date()},
 state                :  {type : Boolean, default : false}
});



ProductSchema.index({location : "2dsphere",category : "text", name : "text"});


ProductSchema.plugin(searchPlugin, { fields: ['name', 'price', 'category']});

module.exports = mongoose.model("Product",ProductSchema);



















