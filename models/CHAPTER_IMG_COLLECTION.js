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

CHAPTER_IMG_COLLECTION.index({CLASS_ID: 1,COURSE_ID:1, CHAPTER_ID:1}, { unique: true });
CHAPTER_IMG_COLLECTION.plugin(uniqueValidator)

module.exports = mongoose.model(
  "CHAPTER_IMG_COLLECTION",
  CHAPTER_IMG_COLLECTION
);