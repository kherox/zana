const Category = require("../models/category")
const api = require("./api");
const async = require("async");

var categories = {
   get_category : function(next,senderID){
     async.waterfall([function(callback){
          var q = Category.find(); 
          q.exec(function(err,results){
               var data =  []; 
                if (err) throw err;
                results.forEach(function(result){
                        data.push({
                            title : result.name,
                            buttons : [
                                {
                                     type  : "postback",
                                     title : result.description,
                                     payload : "PAYLOAD_ADD_CATEGORY_"+result.name.toUpperCase()
                                }
                            ]
                        });
                    });
                   
                    callback(null,data);
          });
     },function(data){
          //console.log(data);
         var message = {
               recipient:{
                   id :senderID
                },
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
      
     ]);
      
   },       
   save_category : function(message){

   },
   




}

module.exports = categories;