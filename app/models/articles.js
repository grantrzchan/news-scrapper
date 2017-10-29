//Require mongoose to create data object to store articles, links and their relevant notes
const mongoose = require("mongoose");

//Save a reference to the Schema constructor for articles
Schema = mongoose.Schema;

// With the Schema constructor, create a Mono schema model for articles
var Art_Schema = new Schema({
    //title is required, type string
    title:{
        type: String,
        required: true
    },
    //url is required, type string
    url:{
        type: String,
        required: true
    } ,
    //note is an object that stores a note id
    //The ref property links the  ObjectId to the NOte model
    //This allows populating of the article model with an associated note
    note:{
        type:Schema.Types.ObjectId,
        ref: "Note"
    }
});

// create and export Article model
export const Article = mongoose.model("Article",Art_Schema);
