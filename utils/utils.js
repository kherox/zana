
var api          = require("./api");
var user         = require("./user");
var category     = require("./category");
var dispatcher   = require("../config/dispatcher");
var Cache        = require("../models/cache");
var profile     = require("../config/profile");
var client      = require("../config/redisfile")
var last_action = false;
module.exports = {

 receivedMessage : function(event,next) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;
  

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        this.sendGenericMessage(senderID);
        break;
      default:
        this.sendTextMessage(senderID, messageText);
       
       // dispatcher.geo_finder(senderID,messageText);
    }
  } else if (messageAttachments) {
    this.messageWithAttachements(senderID, "Message with attachment received",next,messageAttachments);
  } else if (event.postback){
      this.receivedPostback(event);
  } else if (last_action){
    //recuperation du nom de la ville
    last_action = false;
  }
},
 receivedPostback : function(event,next) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;
  switch(payload.toLowerCase()){
    case  'demarer':
      api.user_profile(senderID,next);
      this.choice_language(senderID);
    break;
   case 'payload_french':
      last_action = true;
      var  text  = "Partage ta localisation pour une meilleur qualité de service";
      user.updateUserLanguage('Fr',senderID,next);
      this.share_location(text, senderID);
  break;
  case 'payload_english' :
     last_action = true;
      user.updateUserLanguage('En',senderID,next);
     var text = "Please share your location for best quality of services";
     this.share_location(text, senderID);
case 'payload_add_product':
   // this.sendTextMessage(senderID,"Choice your categories");
   // category.get_category(next,senderID);
   var that =  this;
   user.get_shared(senderID).then(function(user){
    if (user.shared){
      that.sendTextMessage(senderID,"Choice your categories");
      category.get_category(next,senderID);
    }else{
       var  text  = " Partagez votre localisation pour une meilleur qualité de service; Afin d'ajouter des products";
      if (user.default_local != "Fr")
            text = "Please share your location for best quality of services. Before add some products";
     
     that.share_location(text, senderID);
    }
   });
  //console.log(shared);
   break;
case 'payload_list_product':
dispatcher.geo_finder(senderID,undefined);
break;
case 'payload_my_product':
 profile.my_product_list(senderID);
 break;
case 'payload_global_product' :
dispatcher.list_product(senderID);
 break;
    default :
    this.get_action_payload(payload,senderID);
  }

},
get_action_payload : function(payload,senderID){
 dispatcher.dispatch(payload,senderID);
}
,
 sendGenericMessage : function(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",               
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",               
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  api.callSendAPI(messageData);
}
,
 sendTextMessage : function(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };
  //recuperation du niveau et de l'action
  client.get("cache_step_"+recipientId,function(err,result){
    console.log(result);
     if (err)  dispatcher.finder(messageText,senderID);
     //console.log(result);
     if (result) 
        dispatcher.makeOperation(recipientId,result,messageText);
    else 
      dispatcher.finder(messageText,recipientId);
     
  });

  
},
//create offers payload
messageWithAttachements : function(senderID,message,next,event){
    //console.log(event.message.attachments['type']);
 if (event[0].type == "location"){
    user.updateUserLocation(event,senderID,next);
    this.sendTextMessage(senderID,"Thank to use this service. You can begin create product,Look at product, add to favorite");
    this.persistentMenu();
 }else if (event[0].type == "image") {
   //verifier recuperer quel image on doit attacher
   client.get("image_"+senderID,function(err,reply){
     if (err) this.sendTextMessage(senderID,"Cette image n'est  attachée a aucun produit");;
     console.log(reply);
      if (reply){
         dispatcher.UpdateProduct(reply,true,event);
      }
   })
 }else{
   this.sendTextMessage(senderID,message);
 }
},
 
  //partage ta localisation
  share_location : function(text,senderID){
   api.callSendAPI({
        "recipient" : {
              "id"   : senderID
            },
            "message"      : {
                  "text"  : text,
                    "quick_replies" : [
                      {
                        "content_type" : "location",
                        "payload"      : "SHARE_LOCATION"
                      }
                      
                    ]
              }
      })
  },
  //preference langue
  choice_language : function(senderID){
    api.callSendAPI({
      "recipient" : {
        "id"   : senderID
      },
      "message"      : {
        "attachment" : {
          "type"     : "template",
          "payload"  : {
              "template_type" : "generic",
              "elements" : [
                  {
                  "title" : "Preferences",
                  "subtitle":"Choix de la langue || Language Choice",
                  "buttons" : [
                    {
                        "type"  : "postback",
                        "title" : "Francais",
                        "payload":"PAYLOAD_FRENCH"
                    },
                    {
                        "type"  : "postback",
                        "title" : "English",
                        "payload":"PAYLOAD_ENGLISH"
                    }
                ]
               }
              ]
                  
            }
          }
        }
    });
  },
  
  persistentMenu: function(){
    var message = 
       {
           "setting_type" : "call_to_actions",
          "thread_state"  : "existing_thread",
            "call_to_actions":[
                {
                "type"  :"postback",
                "title" :"All Product",
                "payload":"PAYLOAD_LIST_PRODUCT"
                },
               {
                "type" :"postback",
                "title":"MY Product",
                "payload":"PAYLOAD_MY_PRODUCT"
                },
                {
                "type"   :"postback",
                "title"  :"Add Product",
                "payload":"PAYLOAD_ADD_PRODUCT"
                },
                {
                "type":"postback",
                "title":"Favoris",
                "payload":"PAYLOAD_LIST_FAVORITE"
              },
               {
                "type":"postback",
                "title":"Global Product",
                "payload":"PAYLOAD_GLOBAL_PRODUCT"
              },
              ,
               {
                "type":"postback",
                "title":"My Order",
                "payload":"PAYLOAD_ORDER_VIEW"
                }
            ]
    }
    api.thread_settings(message);
  }
  
}