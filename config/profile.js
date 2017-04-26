var api = require("../utils/api");
var Product = require("../models/product");
var async = require("async");

module.exports =  {

 my_product_list : function(senderID){
  async.waterfall([
      function(callback){
          var q = Product.find({senderid : senderID}).where({state : true});
          q.exec(function(err,products){
              var data = [];
            if (err) console.log(err);
            else{
                products.forEach(function(p){
                    data.push({
                                title    : p.name + " "+p.currency + " "+  p.quantities,
                            // subtitle : p.category + "|| "+ p.description,
                                buttons : [
                                    {
                                        type  : "postback",
                                        title : "EDIT",
                                        payload : "PAYLOAD_EDIT_USER_PRODUCT_"+p._id
                                    },
                                    {
                                        type  : "postback",
                                        title : "DELETE",
                                        payload : "PAYLOAD_DELETE_USER_PRODUCT_"+p._id
                                    }
                                ]
                    });
                });
                callback(null,data,senderID);
            }
          });
      },function(data,senderID){
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

            api.callSendAPI(message);
      }
  ])
 }


}