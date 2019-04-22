var mongoose = require("mongoose");

var Schema = mongoose.Schema;

// Article Schema allows for null values because => 
// not all values are provided for every article on Wired.com
var ArticleSchema = new Schema({
    title: String,
    source: String,
    byline: String,
    section: String,
    thumbnail: String,
    // Comments for each article are stored in an array
    comments: [{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;