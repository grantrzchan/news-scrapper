//Require mongoose to create data object to store articles, links and their relevant notes
const mongoose = require("mongoose");

//Save a reference to the Schema constructor for articles
Schema = mongoose.Schema;

// With the Schema constructor, create a Mono schema model for notes
var Note_Schema = new Schema({
    //title is type string
    title:{
        type: String
    },
    //body is type string
    body:{
        type:String
    }
});

// create and export notes model
const Note = mongoose.model("Note",Note_Schema);
module.exports = Note;
