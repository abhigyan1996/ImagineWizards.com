var mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator')
var Schema = mongoose.Schema;

var CHAPTER_IMG_COLLECTION = new Schema({

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
    CHAPTER_IMG: {
        type: String,
        required:true
    },
    CHAPTER_NUM: {
        type:Number,
        required:true,
        default:0
    }

});

module.exports = mongoose.model(
  "CHAPTER_IMG_COLLECTION",
  CHAPTER_IMG_COLLECTION
);