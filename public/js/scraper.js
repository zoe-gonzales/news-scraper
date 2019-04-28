$(document).ready(function(){
    // Event listener for "comment" button - appends a form to add comment to page
    $(document).on("click", ".comment-btn", function() {
        var articleId = $(this).data("id");
        $(`.comment-${articleId}`).empty();
        
        // Generating form and all its parts
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

        // Appending comment components to form
        commentBox.append(name, comment, submitComment);

        // And form to div existing in index.handlebars
        $(`.comment-${articleId}`).append(commentBox);

        formSubmit(articleId);
    });

    // Retrieves data from form and sends to server, then refreshes page
    function formSubmit(id){
        $(document).on("submit", ".add-comment", function(event){
            event.preventDefault();
            event.stopImmediatePropagation();
            
            var newComment = {};
            var userName = $(".add-comment [name=username]").val().trim();
            var comment = $(".add-comment [name=comment]").val().trim();
            
            // Validation on client side to prevent empty submissions
            if (!userName || !comment){
                $(this).prepend("Please complete all fields.");
            } else {
                newComment.username = userName;
                newComment.comment = comment;
            }

            // Emptying inputs for appearance
            $(".add-comment [name=username]").val("");
            $(".add-comment [name=comment]").val("");
    
            $.ajax("/comment/" + id, {
                method: "POST",
                data: newComment
            }).then(function(){
                location.reload();
            });
        });
    }

    // Event listens for click on delete button
    $(document).on("click", ".delete-btn", function() {
        var commentId = $(this).data("id");
        // Requests confirmation from client
        $("#confirmDelete").modal("show");
        deleteComment(commentId);
    });

    // Sends id of item to be deleted to server and refreshes page
    function deleteComment(id){
        // emptying div value if 'close' button is clicked to prevent multiple deletions at once
        $("#ignore").on("click", function(){
            id = '';
        });
            
        $("#delete-comment").on("click", function(){
            $.ajax("/comment/" + id, {
                method: "DELETE"
            }).then(function(){
                location.reload();
            });
        });
    }

    // functionality toggles between starred and unstarred
    function toggleFav(element){
        $(document).on("click", element, function() {
            let favoriteId = $(this).data("id");
            let change = {};
            change.action = $(this).data("action");
            
            $.ajax("/favorites/" + favoriteId, {
                method: "PUT",
                data: change
            }).then(function(){
                location.reload();
            });
        });
    }

    toggleFav(".fav-btn");
    toggleFav(".remove-fav");
});