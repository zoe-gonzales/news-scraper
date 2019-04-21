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
mongoose.connect('mongodb://localhost/scraperdb', {useNewUrlParser: true});

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
      
          db.Article.create({
            title: title,
            source: source,
            byline: byline,
            section: section,
            thumbnail: thumbnail
          })
          .then(function(articleData){
            console.log(articleData);
          })
          .catch(function(error){
            throw error;
          });
        });

      db.Article.find({})
        .then(function(data){
          var articles = data.slice(0, 50);
          res.render("index", {articles: articles});
        })
        .catch(function(error){
          throw error;
        });
    });
});

app.listen(PORT, function(error){
    if (error) throw error;
    console.log("Listening on port " + PORT);
});