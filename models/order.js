var mongoose = require("mongoose");

var Schema = mongoose.Schema;



var OrderSchema = new Schema({
    owner      : {type : String},
    productid  : {type : String }, 
    senderid   : {type : String }, 
    productref : {type : String,unique : true }, 
    user     : {
        username : {type : String},
        lastname : {type : String},
        image    : {type : String},
    },
     geocoder      : {
        address       :  {type :String},
        country       : {type : String},
        city          : {type : String},
        neighborhood  : {type : String},
        placeid       : {type : String},
        streetName   : {type : String},
        councode      : {type : String}
    },
    product  : {
        name      : {type : String},
        price     : {type : Number},
        category  : {type : String},
        image     : {type : String}
    },
    created  :  {type : Date,default : Date.now()}
});



module.exports = mongoose.model("Order",OrderSchema);
























