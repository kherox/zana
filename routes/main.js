var router = require("express").Router();
var utils  = require("../utils/utils");
require('dotenv-extended').load();
var messengerButton = "<html><head><title>Messenger bot AgriN</title></head><body><h1>AgriN</h1>This is bot for agriculture of africa.</body></html>";

//creation de la route par default

router.get("/",function(req,res,next){
     res.render("home");
  //  res.writeHead(200,{'Content-Type' : 'text/html'});
  //  res.write(messengerButton);
  //  res.end();
});



router.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&  req.query['hub.verify_token'] === process.env.VERFICATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

router.post('/webhook', function (req, res,next) {
  var data = req.body;
   console.log(data);
  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
           utils.receivedMessage(event,next);
        } else if (event) {
          utils.receivedPostback(event,next);
        } else  {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });
    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

module.exports = router;