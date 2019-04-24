const mongoose = require("mongoose");

let Schema = mongoose.Schema;

// Comment schema enforces required fields
let CommentSchema = new Schema({
    username: {
        type: String,
        required: "Name is required."
    },
    comment: {
        type: String,
        required: "Field must not be blank."
    }
});

let Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;