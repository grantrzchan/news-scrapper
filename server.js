//Set up dependencies
const express = require("express");
const exphbs = require("express-handlebars");
// const handlebars = require("handlebars");
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
// const mongojs = require("mongojs");
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
    db.Article.find({}).then((found, err) => {
        //If there are no error, send data to browser and print to console
        // console.log(found);cle
        res.render("index", {
            scraper: found
        });
    });
}); //end of app.get() for index

//Route to retrieve all saved articles
app.get("/saved", (req, res) => {
    db.Article.find({
        isSaved: true
    }).then((found, err) => {
        //If there are no error, send data to browser and print to console
        console.log(found); //maybe pretty does't work?
        res.render("saved", {
            scraper: found
        });
    });
}); //end of app.get() for all saved articles

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
            res.render("index", {
                scraper: found
            });
        });
}); //end of app.get() for one article


//Scrape data from a site and place it into mongoDB scraper db
app.get("/scraped", (req, res) => {
    axios.get(`https://www.theonion.com`).then((a_res, a_err) => {
        //load html body from promise to cheerio
        let $ = cheerio.load(a_res.data);
        //Search for each element with a "featured-headline" class
        $(".headline--wrapper").each((index, element) => {
            // let scrapeCount = 0;
            let title = $(element).children("a").children(".featured-headline").text();
            let url = $(element).children("a").attr("href");
            //if both title and url are found for each article, add them to db
            if (title && url) {
                let scrapedData = {};
                scrapedData.title = title;
                scrapedData.url = url;
                db.Article.create(scrapedData).then(function (found, err) {
                    //If no issues occur, send a message to the server stating Scrape completed.
                    console.log("Scrape Completed!");
                    // scrapeCount += 1;
                }).catch(function (err) {
                    //err check for create
                    console.log(err);
                })
            } else {
                console.log("Cannot find title or URL!");
            }
        }); //end of $((".featured-headline").each()
    }).catch(function (a_err) {
        //error check for promise axios.get().then() 
        console.log(a_err);
    }); //end of axios.get().then()
    db.Article.find().then((data, err) => {
        res.json(data);
        // return scrapeCount;
    });
}); //end of app.get() for scraped

//Route to save one article
app.post("/toSave/:id", (req, res) => {
    console.log(req.params.id);
    db.Article.update({
            _id: req.params.id
        }, {
            $set: {
                isSaved: true
            }
        },
        // If successful, mongoose will send back an object containing a key of "ok" with the value of 1, which means a boolean of true
        function (err, data) {
            if (data.ok) {
                console.log("Save Successful");
                res.redirect("/");
            }
            else{
                console.log(err);
            }
        })
}); //end of app.post() to save articles

//Route to unsave one article (delete from /saved route but not from articles collection)
app.post("/unSave/:id", (req, res) => {
    console.log(req.params.id);
    db.Article.update({
        _id: req.params.id
    }, {
            $set: {
                isSaved: false
            }
        },
        // If successful, mongoose will send back an object containing a key of "ok" with the value of 1, which means a boolean of true
        function (err, data) {
            if (data.ok) {
                console.log("Unsave Successful");
                res.redirect("/saved");
            }
            else {
                console.log(err);
            }
        })
}); //end of app.post() to unsave articles

//******************************************* */

//Start the server
app.listen(PORT, () => console.log(`App running on http://localhost: ${PORT}`));