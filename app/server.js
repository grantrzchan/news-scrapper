//Set up dependencies
const express = require("express");
const exphbs = require("express-handlebars");
const handlebars = require("handlebars");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
// Promise based http library, used to handle Ajax requests for both client and server side
const axios = require("axios");
//morgan dependency to log requests
const logger = require("morgan");

//***Move to routes once it works */
const request = require("request");
const mongojs = require("mongojs");
// const express = require("express");
const cheerio = require("cheerio");

// Initialize express
const app = express();

// Set up port properties
PORT = env.process.PORT || 3000;

// Colored outputs by response status will be logged for development use. 
//Red = server error, yellow = client error, cyan = redirection, uncolored = other
app.use(logger("dev"));
//Use body-parser to handle submissions. Takes in string only.
app.use(bodyParser.urlencoded({
    extended: false
}));
//Serve public folder for  use with express
app.use(express.static(path.join(__dirname, "app/public")));
//Set up handlebars
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Set mongoose to use built-in JS ES6 promises features
mongoose.Promise = Promise;
//******************** Use local client for now. Change later****************
mongoose.connect(`mongodb://localhost/news-scrapper`, {
    useMongoClient: true
});

//*******************ROUTES********************
//configure DB
const dbUrl = "scraper";
const collections = ["scrapedData"];

//Connect mongojs to the db constant
const db = mongojs(dbUrl, collections);
//error message on connection failure
db.on("error", (err) => console.log(`DB Error`, err));

//Main route to index?????????????????
app.get("/", (req, res) => {
    try {
        res.render("index", {
            scraper: data
        })
    } catch (err) {
        console.log(err)
    }
});//end of app.get() for index

//Route to retrieve all scraped data????????????
app.get("/all", (req, res) => {
    db.scrapedData.find({},(err,found)=>{
        //error check
        if(err) throw err;
        //If there are no error, send data to browser and print to console
        res.json(found);
        console.log(found.pretty());//maybe pretty does't work?
    });
});//end of app.get() for all

//Scrape data from a site and place it into mongoDB scraper db
app.get("/scraped", (req, res) => {
    request(`https://www.theonion.com`, (err, res, html) => {
        //load html body from request to cheerio
        let $ = cheerio.load(html);
        //Search for each element with a "featured-headline" class
        $(".featured-headline").each((index, element) => {
            let title = $(element).children().find("h3");
            let url = $(element).children().attr("href");
            //if both title and url are find for each article, add them to db
            if (title && url) {
                db.scrapedData.insert({
                        //Try ES6 just property next time
                        title: title,
                        url: url
                    },
                    (err, inserted) => {
                        if (err) throw err;
                        console.log(inserted);
                    })
            }

        }); //end of $((".featured-headline").each()
    }); //end of request()

    //If no issues occur, send a message to the server stating Scrape completed.
    console.log("Scrape complete");
}); //end of app.get() for scraped

//******************************************* */

//Start the server
app.listen(PORT, () => console.log(`App running on http://localhost: ${PORT}`));