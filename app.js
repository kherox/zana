const express    = require("express");
const bodyParser = require("body-parser");
const morgan     = require("morgan");
const engine     = require("ejs-mate");
const ejs        = require("ejs");
const mongoose   = require("mongoose");



const api   = require("./utils/api");
const utils  = require("./utils/utils");
const Category = require("./models/category");
const client   = require("./config/redisfile");

//create app server

var app = express();
app.use(morgan("dev"));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

//global object
var locations = [];
//engine
app.engine("ejs",engine);
app.set("view engine","ejs");

var config = require("./config/config");
mongoose.connect(config.database,function(err){
    if (err) throw err;
   console.log("Connection etablie");
})

//create start button
app.use(function(req,res,next){
    var   messageData = {
      "setting_type" : "call_to_actions",
      "thread_state" : "new_thread",
      "call_to_actions" : [
        {
          "payload" :  "DEMARER"
        }
      ]
    };
    api.thread_settings(messageData);
    next();
});

app.use(function(req,res,next){
//message de bienvenu 
    api.thread_settings({
    "setting_type":"greeting",
       "greeting":{
           "text":"Bonjour {{user_first_name}}, Bienvenu a vous. Agri-N est une bot collaboratif qui se base sur la location pour mettre les paysans, agriculteurs et utilisateur en relation tout en se passant des intermediaires. Nous aurions besoins que vous nous indiquer votre ville ou position via votre GPS pour mieux vous fournir avec precision ce que vous rechercher. Merci"
     }
    });
    next();
});


app.use(function(req,res, next){
 utils.persistentMenu();
 next();
});
//router 
const mainroute     = require("./routes/main");
const defaultroute  = require("./routes/default");
// router middleware
app.use(mainroute);
app.use(defaultroute);


app.listen(process.env.PORT || 3978 ,function(){
    console.log("app runing on port 3978 ")
});