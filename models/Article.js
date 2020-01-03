const mongoose = require("mongoose");
var Schema = mongoose.Schema;

var HockeySchema = new Schema({
    title:{
        type: String,
        required: true
    },
    link: {
        type: String,
        required: false
    },
    blurb: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    }
    
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", HockeySchema);

// Export the Article model
module.exports = Article;
