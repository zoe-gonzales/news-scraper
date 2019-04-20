// loading modules
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");
var exphbs = require("express-handlebars");

var app = express();
var PORT = process.env.PORT || 3000;

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
mongoose.connect('mongodb://localhost/scraper', {useNewUrlParser: true});

app.get("/", function(req, res){
    axios.get("https://www.wired.com/").then(function(response) {

        var $ = cheerio.load(response.data);

        var results = [];

        $("li.post-listing-list-item__post").each(function(i, element) {
          var title = $(element).children().text();
          var src = $(element).find("a").attr("href");
          var byline = $(element).find("span.byline-component__content").text();
          var section = $(element).find("span.post-listing-list-item__byline").text();
          var thumbnail = $(element).find("img").attr("src");
      
          results.push({
            title: title,
            src: src,
            byline: byline,
            section: section,
            thumbnail: thumbnail
          });

        });

        res.json(results);

      });
});

app.listen(PORT, function(error){
    if (error) throw error;
    console.log("Listening on port " + PORT);
});