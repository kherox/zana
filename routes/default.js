var router = require("express").Router();
var faker = require("faker");

var Category = require("../models/category");
var Product  = require("../models/product");



// create offers
router.get("/create_offers",function(req,res,next){
    res.render("offers/add");
});

router.post("/create_offers",function(req,res,next){
  console.log(req.body);
});

router.get("/category",function(req,res,next){
  for(var i =0; i <5; i++){
   var category = new Category();
   category.name = faker.name.jobType();
   category.description = faker.name.jobDescriptor();
   category.save();
  }
  res.send("je suis le kherox");
});
router.get("/product",function(req,res,next){
  var c =[
  {
    "latitude": 64.109174,
    "longitude": -144.22391
  },
  {
    "latitude": 81.148849,
    "longitude": 2.083522
  },
  {
    "latitude": -6.270403,
    "longitude": 177.205526
  },
  {
    "latitude": 6.610937,
    "longitude": 148.80203
  },
  {
    "latitude": 13.40017,
    "longitude": -172.889451
  },
  {
    "latitude": 44.66856,
    "longitude": 43.184813
  },
  {
    "latitude": -54.045881,
    "longitude": 60.69307
  },
  {
    "latitude": -20.269389,
    "longitude": 41.543549
  },
  {
    "latitude": -17.408845,
    "longitude": -128.725807
  },
  {
    "latitude": 12.491097,
    "longitude": -22.485234
  }
];
  for(var i =0; i <10; i++){
   var product = new Product();
   product.owner    = "58e75d3e21fd4703e806b2b9";
   product.coordinate =  {
     type : 'Point',
     coordinates : [c[i].latitude,c[i].longitude]
    };
   product.name     = faker.commerce.productName();
   product.price    = faker.commerce.price();
   product.category = "58e8318ed09d421268798086";
    //console.log(product);
  //  product.save(function(err){
  //     console.log(err);
  //  });
   
  }
  res.send("je suis le kherox");
});








router.get("/view",function(req,res,next){
  
 

  Product
  .find()
  .select({coordinate : 1,_id : 0})
  .exec(function(err,p){
     console.log(p);
     var data = [];
     p.map(function(ps){
        data.push({lat : ps.coordinate.coordinates[0], lng : ps.coordinate.coordinates[1]})
     });
     res.render("map_view",{
      locations :  data
    })
  });
      
 
});







module.exports = router;