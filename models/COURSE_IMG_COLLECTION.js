var mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator')
var Schema = mongoose.Schema;

var COURSE_IMG_COLLECTION = new Schema({

    CLASS_ID: {
        type:String,
        required:true 
    },
    COURSE_ID: {
        type:String,
        required:true  
    },
    COURSE_IMG: {
        type: String,
        required:true
    },
    BUY_COURSE_IMG: {
        type: String,
        required:true
    },
    PRICE: {
        type: Number,
        required: true,
        default:0
    }

});

module.exports = mongoose.model(
  "COURSE_IMG_COLLECTION",
  COURSE_IMG_COLLECTION
);