var mongoose = require("mongoose");

var Schema = mongoose.Schema;


var FavoriteSchema = new Schema({
     owner     : {type : String},
     product   : {type  : Schema.Types.ObjectId,ref : "Product"},
     userid    : {type : String}
});



module.exports = mongoose.model("Favorite",FavoriteSchema);