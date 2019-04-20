var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    username: {
        type: String,
        required: "Name is required."
    },
    comment: {
        type: String,
        required: "Field must not be blank."
    }
});

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;