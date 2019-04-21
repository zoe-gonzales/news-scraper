$(document).ready(function(){

    function openComment(){

    }

    $(document).on("click", ".comment-btn", function() {
        var articleId = $(this).data("id");
        var commentBox = $("<form>")
            .addClass("add-comment");
        var name = $("<input>")
            .addClass("form-control comment-form")
            .attr("placeholder", "Your name")
            .attr("name", "username");
        var comment = $("<textarea>")
            .addClass("form-control comment-form")
            .attr("placeholder", "Your comment")
            .attr("name", "comment");
        var submitComment = $("<button>")
            .addClass("btn btn-outline-dark comment-form comment-btn")
            .attr("type", "submit")
            .text("Submit");

        commentBox.append(name, comment, submitComment);

        $(`.comment-${articleId}`).append(commentBox);

        formSubmit(articleId);
    });

    function formSubmit(id){
        $(document).on("submit", ".add-comment", function(event){
            event.preventDefault();
            event.stopImmediatePropagation();
            
            var newComment = {};
            var userName = $(".add-comment [name=username]").val().trim();
            var comment = $(".add-comment [name=comment]").val().trim();
            
            if (!userName || !comment){
                $(`.comment-${id}`).prepend("Please complete all fields.");
            } else {
                newComment.username = userName;
                newComment.comment = comment;
            }

            $(".add-comment [name=username]").val("");
            $(".add-comment [name=comment]").val("");
    
            $.ajax("/comment/" + id, {
                method: "POST",
                data: newComment
            }).then(function(error){
                if (error){
                    console.log(error);
                } else {
                    location.reload();
                }
            });
        });
    }
});