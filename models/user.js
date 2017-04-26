const mongoose = require("mongoose");
const  GeoJSON = require('mongoose-geojson-schema');



var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username      : {type : String},
    last_name     : {type : String},
    img           : {type : String },
    local         : {type : String},
    default_local : {type : String},
    userid        : {type : String },
    city          :  {type: String },
    gender        :  {type: String },
    location_url  :  {type: String },
    title         :  {type: String },
    shared        :  {type: Boolean , default : false },
    coordinate    :  {type  : 'Point',coordinates : [0,0]},
    location      : [],
    geocoder      : {
        address       :  {type :String},
        country       : {type : String},
        city          : {type : String},
        neighborhood  : {type : String},
        placeid       : {type : String},
        streetName   : {type : String},
        councode      : {type : String}
    }
   
});



// UserSchema.pre("update",function(next){
//  var user = this;
//  if(user.coordinate != undefined){
//      geocoder.reverse({lat : user.coordinate.coordinates[0],lon: user.coordinates.coordinates[1]},function(err,result){
//       if (err) console.error(err);
//       else {
//         user.geocoder.country         = result.country;
//         user.geocoder.neighborhood    = result.extra.neighborhood;
//         user.geocoder.city            = result.city;
//         user.geocoder.streetName      = result.streetName;
//         user.geocoder.placeid         =  result.extra.googlePlaceId;
//         user.geocoder.councode        = result.countryCode;
//       }
//     })
//  }
//   next();
// });


UserSchema.index({location : "2dsphere"});




// UserSchema.pre("save",function(err){
//     var that = this;
//  if (coordinate == "" || coordinate == null)
//        this.coordinate = "";
// });

module.exports = mongoose.model("User",UserSchema);