//Script to do front-end AJAX calls to mongoDB

//Execute functionalities only when the document is fully loaded
$(document).ready(function () {



    //function to perform AJAX call
    function ajaxCall() {
        $(".btn").on("click", saveArticles);

    }

    //function to perform when save button is clicked
    function saveArticles() {
        var ArticleId = $(this).parents("panel").children("article-link").data("_id", scraper._id);
        console.log(ArticleId);
        $.ajax({
            METHOD: "PATCH",
            url: "/toSave/:id",
            data: ArticleId
        }).then((data) => { console.log(data) });
    }

});