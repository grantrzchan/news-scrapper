//Script to do front-end AJAX calls to mongoDB

//Execute functionalities only when the document is fully loaded
document.addEventListener("load", function () {
ajaxCall();
})

//function to perform AJAX call
function ajaxCall() {
    document.getElementsByClassName("save").addEventListener("click", saveArticles);

}

//function to perform when save button is clicked
function saveArticles() {
    var httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        console.log(`Error. Cannot create a new XMLHTTP instance`);
        return false
    }
    httpRequest.open('POST', '/saved', true);
    //Set JSON header
    httpRequest.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    //We want to format data into a JSON and send the request
    httpRequest.responseType = 'json';
    httpRequest.send(this.parentElement.getElementsbyClassName("panel").setAttribute("data", scraper._id));
    httpRequest.onload = () => {
        console.log(this);
        if (this.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                console.log(`request successfully handled`);
            }
            else {
                console.log(`There was a problem with the request.`);
                console.log(httpRequest.status);
            }
        }
    }
}