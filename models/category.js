var mongoose = require("mongoose");

var Schema = mongoose.Schema;



var CategorySchema = new Schema({
    name     : {type : String},
    description :  {type : String}
});



module.exports = mongoose.model("Category",CategorySchema);
























