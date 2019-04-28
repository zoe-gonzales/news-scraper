// loading modules
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const cheerio = require("cheerio");
const axios = require("axios");
const exphbs = require("express-handlebars");

const app = express();
let PORT = process.env.PORT || 3000;
const db = require("./models");

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
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraperdb";

mongoose.connect(MONGODB_URI, {useNewUrlParser: true});

// Rendering homepage
app.get("/", (req, res) => res.render("index"));

// Scraping and sending data
app.get("/scrape", (req, res) => {
  axios.get("https://www.wired.com/")
    .then(response => {

      const $ = cheerio.load(response.data);

      $("ul").each((i, element) => {
        let title = $(element).find("h2").text().trim();
        let source = $(element).find("a").attr("href");
        let byline = $(element).find("a.byline-component__link").text();
        let section = $(element).find("div.brow-component").text();
        let thumbnail = $(element).find("img").attr("src");

        if (title && source && byline && section && thumbnail){
          // take scraped data and compare to data in db to determine if it already exists.
          // Searching db for document that matches the title of the currently scraped one
          db.Article.findOne({title:title})
            .then(data => {
              // if there's not duplicate document
              if (!data){
                // the article is added to the db
                db.Article.create({
                  title: title,
                  source: source,
                  byline: byline,
                  section: section,
                  thumbnail: thumbnail,
                  favorite: false
                })
                .then(articleData => {
                  console.log(articleData);
                  return;
                })
                .catch(error => {
                  console.log(error);
                  res.sendStatus(500);
                  return;
                });
              }
            })
            .catch(error => {
              console.log(error);
              res.status(500);
              return;
            });
        }
      });

      setTimeout(() => res.redirect("/articles"), 500);
      
    });
});

app.get("/articles", (req, res) => {
  db.Article.find({})
  .populate("comments")
  .then(data => res.render("index", {articles: data}))
  .catch(error => {
    console.log(error);
    res.sendStatus(500);
    return;
  });
})

// Adding comments
app.post("/comment/:id", (req, res) => {
  db.Comment.create(req.body)
  .then(commentData => {
    return db.Article
      .findOneAndUpdate({_id:req.params.id}, 
      {$push: {comments:commentData._id}}, 
      {new:true});  
  })
  .then(articleData => res.json(articleData))
  .catch(error => {
    console.log(error);
    res.sendStatus(500);
    return;
  });
});

// Deleting comments
app.delete("/comment/:id", (req, res) => {
  db.Comment.findOneAndDelete({_id:req.params.id})
    .then(result => res.send(result))
    .catch(error => {
      console.log(error);
      res.sendStatus(500);
      return;
    });
});

// Render all favorite articles on fav.handlebars
app.get("/favorites", (req, res) => {
  db.Article.find({favorite: true})
    .populate("comments")
    .then(favs => res.render("fav", {favs: favs}))
    .catch(error => {
      console.log(error);
      res.sendStatus(500);
      return;
    });
});

// Toggle favorites - star and unstar articles
app.put("/favorites/:id", (req,res) => {
  let favorite = (req.body.action === "fav") ? true : false;

  db.Article.findOneAndUpdate(
    {_id:req.params.id}, 
    {$set: {favorite: favorite}})
    .then(result => res.send(result))
    .catch(error => {
      console.log(error);
      res.sendStatus(500);
      return;
    });
});

// App listening on given port
app.listen(PORT, error => {
  if (error) console.log(error);
  else console.log(`Listening on port ${PORT}`);
});