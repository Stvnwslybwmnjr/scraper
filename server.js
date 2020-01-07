var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");
// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

app.engine("handlebars", exphbs({defaultLayout: "main"})); //my template engine
app.set("view engine", "handlebars");

// Routes

app.get("/", function(req, res) {
  let something = {};
  res.render("index", something);
});


// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
axios.get("https://www.nhl.com/").then(function(response) {
  console.log("Scrape Route Hit");
  var $ = cheerio.load(response.data);

  var results = [];

  $("h5.showcase__headline").each(function(i, element) {

   title = $(element).text().trim();

   link = $(element).parent().parent().parent().attr("href");

    blurb = $(element).siblings('span')[0].children[0].data.trim( )

    
    results.push({
      title: title,
      link: link,
      blurb,
    });

    db.Article.create(results)
    .then(function(dbArticle) {
      console.log(dbArticle)
    })
    .catch(function(err) {
      console.log(err);
    })
  });
  console.log(results);
  res.send("Scrape Completed");
});
});

app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});



// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
