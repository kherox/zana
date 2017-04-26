var api = require("./api");

module.exports = {
    
    add_name : function(senderID){
            var message = {
                recipient : {
                    id : senderID
                },
                message :{
                    text : "Product name"
                }
            };
            api.callSendAPI(message);
   },
    add_price : function(senderID){
                var message = {
                    recipient : {
                        id : senderID
                    },
                    message :{
                        text : "Product price"
                    }
                };
                api.callSendAPI(message);

    },
    add_image : function(senderID){
                var message = {
                    recipient : {
                        id : senderID
                    },
                    message :{
                        text : "Product Image"
                    }
                };
                api.callSendAPI(message);

    },
    add_description : function(senderID){
                var message = {
                    recipient : {
                        id : senderID
                    },
                    message :{
                        text : "Description"
                    }
                };
                api.callSendAPI(message);

    },
    add_quantity : function(senderID){
                var message = {
                    recipient : {
                        id : senderID
                    },
                    message :{
                        text : "Quantity"
                    }
                };
                api.callSendAPI(message);

    },
    confirm_create : function(p,senderID){
        var message = {
            recipient : {id : senderID},
            message   :{
                attachment :{
                    type : "template",
                    payload :  {
                        template_type : "generic",
                        elements : [
                            {
                                title    : p.name + " "+p.currency + " "+  p.quantities,
                                subtitle : p.category + "|| "+ p.description,
                                image_url : p.image,
                                buttons:[
                                     {
                                         type  : "postback",
                                         title : "YES",
                                         payload:"PAYLOAD_YES_PRODUCT_CREATE"
                                     },
                                     {
                                         type  : "postback",
                                         title : "NO",
                                         payload:"PAYLOAD_NO_PRODUCT_CREATE"
                                     }
                                ]
                             }
                        ]
                    }
                }
            }
        };
        api.callSendAPI(message);
    },
    notification : function(text,senderID){
      var message = {
          recipient : {id : senderID},
          message   : {text:  text}
      }
      api.callSendAPI(message);
    },
    list_products : function(message){
        api.callSendAPI(message);
    },
    categories_filter : function(message){
        api.callSendAPI(message);
    }
    
}
