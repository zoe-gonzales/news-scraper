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

app.get("/", function(req, res){
    res.render("index");
});

app.get("/scrape", function(req, res){
  axios.get("https://www.wired.com/").then(function(response) {

      var $ = cheerio.load(response.data);

      $("li.post-listing-list-item__post").each(function(i, element) {
        var title = $(element).find("h5").text();
        var source = $(element).find("a").attr("href");
        var byline = $(element).find("span.byline-component__content").text();
        var section = $(element).find("span.post-listing-list-item__byline").text();
        var thumbnail = $(element).find("img").attr("src");

        // take scraped data and compare to data in db to determine if it already exists.
        // Searching db for document that matches the title of the currently scraped one
        db.Article.findOne({"title":title})
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
                res.sendStatus(200);
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
      });

      db.Article.find({})
        .populate("comments")
        .then(function(data){
          var articles = data.slice(0, 50);
          console.log(articles[0]);
          res.render("index", {articles: articles});
          
        })
        .catch(function(error){
          console.log(error);
          res.status(500);
          return;
        });
  });
});

app.post("/comment/:id", function(req, res){
  console.log(req.body);
  db.Comment.create(req.body)
  .then(function(commentData){
    return db.Article
      .findOneAndUpdate({_id:req.params.id}, 
        {$push: {comments:commentData._id}}, 
        {new:true})
      .catch(function(error){
        if (error){
          console.log(error);
        }
      });
  })
  .catch(function(error){
    console.log(error);
    res.sendStatus(500);
    return;
  });
});

app.listen(PORT, function(error){
    if (error) {
      console.log(error);
    } else {
      console.log("Listening on port " + PORT);
    } 
});