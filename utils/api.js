require('dotenv-extended').load();
var request = require("request");
var user = require("./user");
var nodeGeocoder = require("node-geocoder");


module.exports = {
   callSendAPI : function(messageData) {
    request({
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: messageData

    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var recipientId = body.recipient_id;
        var messageId = body.message_id;
        console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
      } else {
        console.error("Unable to send message.");
        console.error(response);
        console.error(error);
      }
    });  
  },

  thread_settings : function(messageData){
     request({
      uri: 'https://graph.facebook.com/v2.6/me/thread_settings',
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: messageData

    }, function (error, response, body) {
      if (error && response.statusCode != 200) {
        console.error("Unable to send message.");
        console.error(error);
      }else{
        console.log(body);
      }
    });  
  },
  whitelisted : function(messageData){
     request({
      uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: messageData

    }, function (error, response, body) {
      if (error && response.statusCode != 200) {
        console.error("Unable to send message.");
        console.error(error);
      }else{
        console.log(body);
      }
    });  
  },
  user_profile : function(userID,next){
     request({
      uri: 'https://graph.facebook.com/v2.6/'+userID,
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: 'GET'
    }, function (error, response, body) {
      if (error && response.statusCode != 200) {
        console.error("Unable to send message.");
        console.error(error);
      }else{
        user.saveUser(JSON.parse(body),userID,next);
      }
    });  
  }
}
        
        /*
         user.username  = data['first_name'];
        user.last_name = data['last_name'];
        user.img       = data['profile_pic'];
        user.local     = data['locale'];
        user.gender    = data['gender'];
        */
// "message"      : {
//           "attachment" : {
//             "type"     : "template",
//             "payload"  : {
//                 "template_type" : "generic",
//                 "elements" : [
//                      {
//                       "title":"Welcome to Peter\'s Hats",
//                       "subtitle":"We\'ve got the right hat for everyone.",
//                       "item_url" : "https://ffcd2b4e.ngrok.io/create_offers",
//                       // "default_action": {
//                       //     "type" : "web_url",
//                       //     "url" : "https://54c08c0c.ngrok.io/create_offers"
//                       // },
//                       "buttons":[
//                         {
//                           "type":"web_url",
//                           "url":"https://ffcd2b4e.ngrok.io/create_offers",
//                           "title":"Select Criteria",
//                           "webview_height_ratio": "full",
//                           //"html"  : messengerButton
//                           "messenger_extensions": true,  
//                           //"fallback_url": "https://petersfancyapparel.com/fallback"
//                         }
//                      ]
//                   }   
//                 ]

              
                    
//               }
//             }
//           }