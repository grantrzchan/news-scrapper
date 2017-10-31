//Set up dependencies
const express = require("express");
const exphbs = require("express-handlebars");
const handlebars = require("handlebars");
const bodyParser = require("body-parser");
// const methodOverride = require("method-override");
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
const PORT = process.env.PORT || 3000;

// Colored outputs by response status will be logged for development use. 
//Red = server error, yellow = client error, cyan = redirection, uncolored = other
app.use(logger("dev"));
//Use body-parser to handle submissions. Takes in string only.
app.use(bodyParser.urlencoded({
    extended: false
}));
//Serve public folder for  use with express
app.use(express.static(path.join(__dirname, 'public')));
//Set up handlebars
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
// //use views folder
// app.set('views', './views');

// Set mongoose to use built-in JS ES6 promises features
mongoose.Promise = Promise;
//******************** Use local client for now. Change later****************
//Connect to mongoDB

const MongoDatabase = process.env.MONGODB_URI || `mongodb://localhost/scrapper`;

mongoose.connect(MongoDatabase, {
    useMongoClient: true
}, function (err) {
    if (err) throw err;
    console.log(`Connected to DB!`);
});

//require models
db = require(path.join(__dirname, 'models'));
console.log(path.join(__dirname, 'models'));

//*******************ROUTES********************
//configure DB
// const dbUrl = "scraper";
// const collections = ["scrapedData"];

//Connect mongojs to the db constant
// const db = mongojs(dbUrl, collections);
//error message on connection failure
// db.on("error", (err) => console.log(`DB Error`, err));

//Main route to index?????????????????
app.get("/", (req, res) => {
            db.Article.find().then((found, err) => {
                //If there are no error, send data to browser and print to console
                console.log(found);
                res.render("index", {
                    scraper: found
                });
            });
            }); //end of app.get() for index

            //Route to retrieve all scraped article????????????
            app.get("/articles", (req, res) => {
                db.Article.find().then((found, err) => {
                    //If there are no error, send data to browser and print to console
                    res.json(found);
                    console.log(found.pretty()); //maybe pretty does't work?
                    res.redirect("/");
                }).catch(function (err) {
                    //error check
                    res.json(err);
                });
            }); //end of app.get() for all articles

            //Route to retrieve one article
            app.get("/articles/:id", (req, res) => {
                //Use id, prepare query
                db.Article.findOne({
                        _id: req.params.id
                    })
                    //populate notes before going through promise??
                    .populate("Note")
                    .then((found, err) => {
                        //If there are no error, send data to browser and print to console
                        res.json(found);
                        console.log(found.pretty()); //maybe pretty does't work?
                        res.redirect("/");
                    }).catch(function (err) {
                        //error check
                        res.json(err);
                    });
            }); //end of app.get() for one article


            //Scrape data from a site and place it into mongoDB scraper db
            app.get("/scraped", (req, res) => {
                axios.get(`https://www.theonion.com`).then((a_res, a_err) => {
                    //load html body from promise to cheerio
                    let $ = cheerio.load(a_res.data);
                    //Search for each element with a "featured-headline" class
                    $(".headline--wrapper").each((index, element) => {
                        let title = $(element).children("a").children(".featured-headline").text();
                        let url = $(element).children("a").attr("href");
                        //if both title and url are found for each article, add them to db
                        if (title && url) {
                            let scrapedData = {};
                            scrapedData.title = title;
                            scrapedData.url = url;
                            db.Article.create(scrapedData).then(function (found, err) {
                                //If no issues occur, send a message to the server stating Scrape completed.
                                // res.send("Scrape Completed!");
                                console.log("Scrape Completed!");
                            }).catch(function (err) {
                                //err check for create
                                console.log(err);
                            })
                        } else {
                            // res.send("Cannot find title or URL!");
                            console.log("Cannot find title or URL!");
                        }
                    }); //end of $((".featured-headline").each()
                }).catch(function (a_err) {
                    //error check for promise axios.get().then() 
                    console.log(a_err);
                }); //end of axios.get().then()
                db.Article.find().then((data, err) => {
                    res.json(data);
                });
            }); //end of app.get() for scraped

            //Route to update/insert one article
            app.post("/articles/:id", (req, res) => {
                //Create new note for article passed
                db.Note.create(req.body).then(function (found, err) {
                    // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
                    // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
                    // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                    return db.Article.findOneAndUpdate({
                        _id: req.params.id
                    }, {
                        note: dbNote._id
                    }, {
                        new: true
                    });
                }).then(function (found) {
                    res.json(found);
                    res.redirect("/");
                }).catch(function (err) {
                    //catch any error that occurs
                    res.json(err);
                });
            }); //end of app.post()

            //******************************************* */

            //Start the server
            app.listen(PORT, () => console.log(`App running on http://localhost: ${PORT}`));