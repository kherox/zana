var product = require("../utils/product");
var api = require("../utils/api");
var Product = require('../models/product');
var User    = require('../models/user');
var Cache   = require('../models/cache');
var Favorite= require('../models/favorite');
var async   = require("async");
var client  = require("../config/redisfile");
var Order   = require("../models/order");

var dispatcher =  {
 // process : false,
   message : {},
   dispatch : function(payload,senderID){
        var d         = payload.split("_");
        var action    = d[1];
        var provider  = d[2];
        var name      = d[3];
        var id = "";
        var user = "";

        if(d.length == 5){id = d[4];}
        if(d.length == 6){user = d[5];}
       if (action == "NO"){
          Cache.findOne({userid : senderID},function(err,cache){
             Product.findOneAndRemove({_id : cache.currentid},function(err){
                 if (err) console.log(err);
                 else {
                    var text = "Thanks. Product delete";
                    product.notification(text,senderID);
                     Cache.findOneAndRemove({userid : senderID},function(err){
                         if (err) console.log(err);
                     });
                 }
             })
          });
       }else if (action == "YES"){
         Cache.findOneAndRemove({userid : senderID});
         var text = "Thanks. Product create success";
         product.notification(text,senderID);
       }
       if (action == "ADD" && provider == "CATEGORY") {
        product.add_name(senderID);
        var q = User.findOne({userid : senderID});
        q.exec(function(err,res){
            if (err) throw err;
            var p = new Product();
            p.location     = res.location; 
            p.owner        = res._id;
            p.user         = res.username;
            p.senderid     = senderID;
            p.category     = name.toLowerCase();
            p.coordinate   = {type :"Point",coordinates: [res.coordinate.coordinates[0],res.coordinate.coordinates[1]]}
            p.geocoder     = res.geocoder;
            p.save(function(err){
                if (err)
                console.log(err);
                else    {
                    client.set("cache_currentid_"+senderID,p._id);
                    client.set("cache_userid_"+senderID,senderID);
                    client.set("cache_step_"+senderID,1);
                }

            });
        });
       }
      if (action =="EDIT" && provider == "USER"){
        client.set("cache_currentid_"+senderID,id);
        client.set("cache_userid_"+senderID,senderID);
        client.set("cache_step_"+senderID,1);
        product.add_name(senderID);
      }else if (action =="DELETE" && provider == "USER"){
         
          Product.findByIdAndUpdate(id,{state : false},function(err){
              //console.log(err);
          });
      }

      if (action == "ADD" && provider == "FAVORITE")  {
         //tester si le produit n'est pas deja ajouter a tes favoris
         Favorite.findOne({product : d[4]},function(err,p){
           Favorite.findOneAndRemove
            if(err) console.log(err);
            if (p){
                product.notification("Product already in your favorite ",senderID);
            }else{
                var favorite = new Favorite();
                favorite.owner   = d[5];
                favorite.product = d[4];
                favorite.userid  = senderID;
                favorite.save(function(err){
                    if (err) console.log(err);
                    product.notification("Product added to your favorite",senderID);
                    
                });
            }
         });
      }
      if (action == "LIST" && provider == "FAVORITE")  {
          var data = [];
         Favorite
         .find()
         .populate("product")
         .where({userid : senderID})
         .exec(function(err,results){
            results.forEach(function(favorite){
                data.push({
                    title    : favorite.product.name + " "+favorite.product.price,
                    subtitle : favorite.product.description + " "+ favorite.product.category,
                    buttons  : [
                        {
                            title : "DELETE",
                            type  : "postback",
                            payload : "PAYLOAD_DELETE_FAVORITE_"+favorite._id
                        },
                        {
                            title : "VIEW LOCATION",
                            type  : "postback",
                            payload : "PAYLOAD_VIEW_PRODUCT_LOCATION_"+favorite.product._id
                        }
                    ]

                })
            });
             var message = {
                recipient:{id :senderID},
                message: {
                    attachment:{
                        type : "template",
                            payload : {
                            template_type : "generic",
                            //text          : "Category Menu",
                            //buttons      : data
                            "elements": data
                        }
                     }
                }
            };
            product.list_products(message);
         });
      }
      //"PAYLOAD_SEND_ORDER_"+product._id+"_"+product.senderid
      if (action == "SEND" && provider == "ORDER"){
          that = product;
          User
          .findOne({userid : senderID})
          .select("username last_name img geocoder")
          .exec(function(err,user){
             if (err) console.log(user);
             Product
             .findById(d[3])
             .select("name price category image _id")
             .exec(function(err,product){
                 var order = new Order();
                 order.user.username    = user.username;
                 order.user.lastname    = user.last_name;
                 order.geocoder         = user.geocoder;
                 order.user.image       = user.img;
                 order.product.name     = product.name;
                 order.product.price    = product.price;
                 order.product.category = product.category;
                 order.product.image    = product.image;
                 order.owner            = d[4];
                 order.senderid         = senderID;
                 order.productid        = product._id;
                 order.productref        = product._id+"_"+senderID+"_"+d[4];
                 order.save(function(err,order){
                      if (err) {that.notification("Order already  send 😖",senderID); console.log(err);}
                          else    that.notification("Order send succefuly (y)",senderID);
                 });
             })
          }); //git fetch && git checkout agrin https://dvoyd@bitbucket.org/dvoyd_team/dvoydbot.git

      }
   },
   makeOperation : function(senderID,cache,data){
      //client.set("cache_currentid_"+senderID,id);
      client.get("cache_currentid_"+senderID,function(err,reply){
        Product.findOne({_id : reply},function(err,p){
            var state = false;
            if (err){
                console.log(err)
            }else{
                    
                    if (cache == 1){
                        p.name = data;
                        product.add_quantity(senderID);
                    }else if (cache == 2) {
                        var re = /\D/g;
                        p.quantity = re[Symbol.replace](data,"");
                        p.quantities = data;
                    product.add_description(senderID);
                    }else if (cache == 3){
                        if (data !=""  && data.length >5){
                            p.description = data;
                        }
                    
                        product.add_price(senderID);
                    }else if (cache == 4){
                        var re = /\D/g;
                        p.price = re[Symbol.replace](data,"");
                        p.currency = data;
                        product.add_image(senderID);
                        client.set("image_"+senderID,p._id);
                    
                    }
                    dispatcher.UpdateProduct(p._id,false,p);
                
                }
        });
    });
   },
 list_product : function(senderID){
       async.waterfall([
           function(callback){
                Product.find({},function(err,products){
                 var data = []; var categories = [];
                  dispatcher.build_product_and_categories(products,data,categories);
                  callback(null,data,categories);
                });
           },
           function(data,categories){
            
            dispatcher.build_message(data,senderID);
            product.list_products(dispatcher.message);
            dispatcher.message = {};
             product.notification("We can filter. Choice your categorie",senderID);
            dispatcher.build_message(categories,senderID);
            product.categories_filter( dispatcher.message);
           }
       ])
   },
  geo_finder : function( senderID, exp ){

      client.get("lat_"+senderID,function(err,lat){
        //get long
            client.get("lng_"+senderID,function(err,lng){
                 var point = {type : 'Point',coordinates : [parseFloat(lat),parseFloat(lng)]};
                Product.geoNear(point,
                {
                    spherical     : true,
                    distanceField : "location",
                }).then(function(docs)
                {
                    var data = []; var categories = []; 
                    dispatcher.build_product_and_categories(docs,data,categories);
                    dispatcher.build_message(data,senderID);
                    product.list_products(dispatcher.message);
                    },function(err){
                       // console.log(err);
                    });

                })
      });
    },
   build_product_and_categories: function(products,data,categories){
                products.forEach(function(p){
                    var product = new Product();
                    if (p.obj){
                        product = p.obj;
                    }else{
                        product = p;
                    }
                   
                        data.push({
                                title : product.name,
                                subtitle : product.description + " "+ product.price + " FCFA. Powered by "+ product.user,
                                image_url : product.image,
                                buttons:[
                                    {
                                        title : "COMMANDER",
                                        type  : "postback",
                                        payload : "PAYLOAD_SEND_ORDER_"+product._id+"_"+product.senderid
                                    },
                                    {
                                        title : "Add To Favorite",
                                        type  : "postback",
                                        payload : "PAYLOAD_ADD_FAVORITE_USER_"+product._id+"_"+product.user
                                    }
                                ]
                            });
                        categories.push({
                            title : product.category,
                           // subtitle : product.description + " "+ product.price + " FCFA. Powered by "+ product.user,
                            buttons:[
                                {
                                     title   :product.category,
                                      type    : "postback",
                                      payload : "PAYLOAD_FILTER_CATEGORIES_SELECTED_"+product.category
                                }
                            ]
                           
                        });
                });
   },
   build_message : function(data,senderID){
            //console.log( dispatcher.message);
         dispatcher.message = {
                recipient:{id :senderID},
                message: {
                    attachment:{
                        type : "template",
                            payload : {
                            template_type : "generic",
                            //text          : "Category Menu",
                            //buttons      : data
                            "elements": data
                        }
                     }
                }
            };
   },
   finder : function(exp,senderID){
    var data = []; var  categories = [];
    client.get("city_"+senderID,function(err,city){
        client.get("neighborhood_"+senderID,function(err,neighborhood){
            Product
            .find( {$text : {$search :exp }})
            .where({"geocoder.city" :city})
            .or({"geocoder.neighborhood": neighborhood})
            .exec(function(err,results){
                    that = product;
                    if (results.length != 0){
                    results.map(function(product){
                        data.push({
                                        title : product.name,
                                        subtitle : product.description + " "+ product.price + " FCFA. Powered by "+ product.user,
                                        image_url : product.image,
                                        buttons:[
                                            
                                            {
                                                title : "Add To Favorite",
                                                type  : "postback",
                                                payload : "PAYLOAD_ADD_FAVORITE_USER_"+product._id+"_"+product.user
                                            },
                                            {
                                                type  : "element_share",
                                            }
                                        ]
                        });
                        dispatcher.build_message(data,senderID);
                        that.list_products(dispatcher.message);
                    });
                }else{
                    that.notification("Sorry . No product found. Please try again",senderID);
                }
             });
           });
    });
   },

   UpdateProduct : function(id,state,event){
   if (!state){
       dispatcher.sendUpdateProduct(id,state,event);       
   }else{
       Product.findById(id,function(err,p){
            p.image = event[0].payload.url;
            p.state = true;
            dispatcher.sendUpdateProduct(id,state,p);
       })
       
   }
},
sendUpdateProduct : function(id,state,p){
    Product.update({_id :id},p,function(err){
                if (err) console.error(err);
                if(state){
                    var cache       = new Cache();
                    //recuperation de l'id courant
                client.get("cache_currentid_"+p.senderid,function(err,reply){
                    if (err) console.log(err);
                    cache.currentid = reply;
                    cache.userid    = p.senderid;
                    //recuperation du step
                    client.get("cache_step_"+p.senderid,function(err,res){
                        cache.step = res;
                        cache.state = true;
                        cache.save();
                        //suppression 
                        client.del("cache_currentid_"+p.senderid);
                        client.del("cache_step_"+p.senderid);
                        client.del("cache_userid_"+p.senderid);
                        client.del("image_"+p.senderid);
                        product.confirm_create(p,p.senderid);
                    });
                });
                    
                }else{
                    var key = "cache_step_"+p.senderid;
                    client.incr(key);
                   
                   
                }
        });
      }
}

module.exports = dispatcher;