var mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;
var USER_PROFILE_COLLECTION=require("./USER_PROFILE_COLLECTION");

var STUDENT_LEADERBOARD_COLLECTION = new Schema({

    EMAIL: {
        type: String,
        required: true
      },
    COMPLETION_DATE_TIME:{
        type: Date,
        default:Date.now
    },
    ACCURACY:{
        type:Number,
        required:true,
        default:0
    },
    CONCEPT_ID:{
        type:String,
        required:true
    },
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
    RESTARTS: {
        type:Number,
        default:4,
        min: 0,
        max: 4
    }
},{toObject: {virtuals:true},toJSON:true,collection:"STUDENT_LEADERBOARD_COLLECTION"});

STUDENT_LEADERBOARD_COLLECTION.virtual('LeaderBoardToProfileJoin', {
    ref: 'USER_PROFILE_COLLECTION',
    localField: 'EMAIL',
    foreignField: 'EMAIL',
    justOne: true 
  });

STUDENT_LEADERBOARD_COLLECTION.index({ EMAIL: 1, CONCEPT_ID: 1, CLASS_ID:1, CHAPTER_ID:1, COURSE_ID:1}, { unique: true });
STUDENT_LEADERBOARD_COLLECTION.plugin(uniqueValidator)

module.exports = mongoose.model(
  "STUDENT_LEADERBOARD_COLLECTION",
  STUDENT_LEADERBOARD_COLLECTION
);