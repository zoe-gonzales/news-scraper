// loading modules
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");
var exphbs = require("express-handlebars");

var app = express();
var PORT = process.env.PORT || 3000;
var db = require("./models");

// Morgan
app.use(logger("dev"));

// Parsing request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serving static files
app.use(express.static("public"));

// Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connecting to db with Mongoose
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraperdb";

mongoose.connect(MONGODB_URI, {useNewUrlParser: true});

// db.Article.deleteMany({})
//   .then(function(result){
//     console.log(result);
//   })
//   .catch(function(error){
//     console.log(error);
//   });

// Rendering homepage
app.get("/", function(req, res){
    res.render("index");
});

// Scraping and sending data
app.get("/scrape", function(req, res){
  axios.get("https://www.wired.com/")
    .then(function(response) {

      var $ = cheerio.load(response.data);

      $("ul").each(function(i, element) {
        var title = $(this).find("h2").text().trim();
        var source = $(this).find("a").attr("href");
        var byline = $(this).find("a.byline-component__link").text();
        var section = $(this).find("div.brow-component").text();
        var thumbnail = $(this).find("img").attr("src");

        if (title && source && byline && section && thumbnail){
          // take scraped data and compare to data in db to determine if it already exists.
          // Searching db for document that matches the title of the currently scraped one
          db.Article.findOne({title:title})
            .then(function(data){
              // if there's not duplicate document
              if (!data){
                // the article is added to the db
                db.Article.create({
                  title: title,
                  source: source,
                  byline: byline,
                  section: section,
                  thumbnail: thumbnail
                })
                .then(function(articleData){
                  console.log(articleData);
                  return;
                })
                .catch(function(error){
                  console.log(error);
                  res.sendStatus(500);
                  return;
                });
              }
            })
            .catch(function(error){
              console.log(error);
              res.status(500);
              return;
            });
        }
      });

      setTimeout(function(){
        res.redirect("/articles");
      }, 500);
      
    });
});

app.get("/articles", function(req, res){
  db.Article.find({})
  .populate("comments")
  .then(function(data){
    res.render("index", {articles: data});
  })
  .catch(function(error){
    console.log(error);
    res.sendStatus(500);
    return;
  });
})

// Adding comments
app.post("/comment/:id", function(req, res){
  db.Comment.create(req.body)
  .then(function(commentData){
    return db.Article
      .findOneAndUpdate({_id:req.params.id}, 
      {$push: {comments:commentData._id}}, 
      {new:true});  
  })
  .then(function(articleData){
    res.json(articleData);
  })
  .catch(function(error){
    console.log(error);
    res.sendStatus(500);
    return;
  });
});

// Deleting comments
app.delete("/comment/:id", function(req, res){
  db.Comment.remove({_id:req.params.id})
    .then(function(result){
      res.send(result);
    })
    .catch(function(error){
      console.log(error);
      res.sendStatus(500);
      return;
    });
});

// App listening on given port
app.listen(PORT, function(error){
    if (error) {
      console.log(error);
    } else {
      console.log("Listening on port " + PORT);
    } 
});