const mongoose = require("mongoose");

let Schema = mongoose.Schema;

// Article Schema allows for null values because => 
// not all values are provided for every article on Wired.com
let ArticleSchema = new Schema({
    title: String,
    source: String,
    byline: String,
    section: String,
    thumbnail: String,
    favorite: Boolean,
    // Comments for each article are stored in an array
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

let Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;