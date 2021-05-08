var mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator')
var Schema = mongoose.Schema;

var CONCEPT_IMG_COLLECTION = new Schema({

    CLASS_ID: {
        type:String,
        required:true 
    },
    CHAPTER_ID: {
        type:String,
        required:true 
    },
    COURSE_ID: {
        type:String,
        required:true  
    },
    CONCEPT_ID: {
        type:String,
        required:true  
    },
    CONCEPT_IMG: {
        type: String,
        required:true
    },
    CHAPTER_NUM:{
        type: Number,
        required: true
    },
    CONCEPT_NUM:{
        type: Number,
        required: true
    }

});

module.exports = mongoose.model(
  "CONCEPT_IMG_COLLECTION",
  CONCEPT_IMG_COLLECTION
);