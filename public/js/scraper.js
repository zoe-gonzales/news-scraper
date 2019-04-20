$(document).ready(function(){

    $.ajax("/scrape", {
        method: "GET"
    }).then(function(error, data){
        if (error) throw error;
        console.log(data);
    });


});