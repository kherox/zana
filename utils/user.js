var User  = require("../models/user")
var nodeGeocoder = require("node-geocoder");
var client       = require('../config/redisfile')

var options = {
            provider: 'google',
            // Optional depending on the providers
            httpAdapter: 'https', // Default
            apiKey: process.env.GOOGLE_MAPS_API_KEY, // for Mapquest, OpenCage, Google Premier
            formatter: null         // 'gpx', 'string', ...
    };
    var geocoder = new nodeGeocoder(options);

var userutils = {
    saveUser : function(data,userid,next){
        var user = new User();
        user.username  = data.first_name;
        user.last_name = data.last_name;
        user.img       = data.profile_pic;
        user.local     = data.locale;
        user.gender    = data.gender;
        user.userid    = userid;       
        user.save(function(err,result){
          if (err) return  next(err);
           next();
        });
        
    },
    updateUserLocation : function(data,userid,next){
        User.findOne({userid : userid},function(err,user){
             user.location_url   = data[0].url;
             user.coordinate     ={
                 type : "Point",
                 coordinates : [data[0].payload.coordinates.lat,data[0].payload.coordinates.long]
             };
             user.location  = [data[0].payload.coordinates.lat,data[0].payload.coordinates.long];
             user.title = data[0].title;
            geocoder.reverse({lat :data[0].payload.coordinates.lat,lon: data[0].payload.coordinates.long},function(err,result){
            if (err) throw err;
            else {
                user.geocoder.country         = result[0].country;
                user.geocoder.neighborhood    = result[0].extra.neighborhood;
                user.geocoder.city            = result[0].city;
                user.geocoder.streetName      = result[0].streetName;
                user.geocoder.placeid         = result[0].extra.googlePlaceId;
                user.geocoder.councode        = result[0].countryCode;
                user.shared                   = true;
                 User.update({userid : userid},user,function(err){
                    if (err) return next(err);
                    client.set("lat_"+userid,data[0].payload.coordinates.lat);
                    client.set("lng_"+userid,data[0].payload.coordinates.long);
                    client.set("country_"+userid,user.geocoder.country);
                    client.set("city_"+userid,user.geocoder.city);
                    client.set("neighborhood_"+userid,user.geocoder.neighborhood);
                    client.set("shared_"+userid, user.shared);
                   
                });
            }
            })
        });
    },
    updateUserLanguage : function(langue,userid,next){
         User.findOne({userid : userid},function(err,user){
             user.default_local   = langue;
             User.update({userid :userid},user,function(err){
                if (err) return next(err);
                client.set("user_ln_"+userid,langue);
                next();
             });
        });
    },
    get_shared : function(senderID){
      // var shared = false;
       return User
       .findOne({userid : senderID})
       .select("shared default_local")
       .exec(function(err,u){
          if (err) throw err;
         return  u;
       });
    },
    setCache : function(userid){

    User.findOne({userid : userid},function(err,user){
        if (err) console.log(err);
         client.set("lat_"+userid,user.location[0]);
        client.set("lng_"+userid,user.location[1]);
        client.set("country_"+userid,user.geocoder.country);
        client.set("city_"+userid,user.geocoder.city);
        client.set("neighborhood_"+userid,user.geocoder.neighborhood);
        client.set("shared_"+userid, user.shared);
        client.set("user_ln_"+userid,user.default_local);
    })

    }

};


module.exports = userutils;
 