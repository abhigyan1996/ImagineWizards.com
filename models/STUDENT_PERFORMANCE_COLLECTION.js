var mongoose = require("mongoose");
var ALL_QUESTIONS_COLLECTION=require("./ALL_QUESTIONS_COLLECTION");
const uniqueValidator = require('mongoose-unique-validator')
var Schema = mongoose.Schema;
var USER_PROFILE_COLLECTION=require("./USER_PROFILE_COLLECTION");   //newly added

var STUDENT_PERFORMANCE_COLLECTION = new Schema({

    EMAIL: {
        type: String,
        required: true
      },
    ANSWER_DATE_TIME:{
        type: Date,
        default:Date.now
    },
    INPUT_OPT:{
        type:String,
        required:true,
        default:""
    },
    QUESTION_ID:{
        type:Number,
        required:true
    },
    CORRECT_FLAG: {
        type:Number,
        min:0,
        max:2,
        default:2
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
    CHAPTER_NUM: {
        type: Number,
        required:true
    },
    CONCEPT_NUM: {
        type: Number,
        required:true
    },
    CHAPTER_NUM: {
        type: Number,
        required:true 
    }
},{toObject: {virtuals:true},toJSON:true,collection:"STUDENT_PERFORMANCE_COLLECTION"});


STUDENT_PERFORMANCE_COLLECTION.virtual('PerformanceToAllQuestionCollectionJoin', {
    ref: 'ALL_QUESTIONS_COLLECTION',
    localField: 'QUESTION_ID',
    foreignField: 'QUESTION_ID',
    justOne: true
  });

STUDENT_PERFORMANCE_COLLECTION.virtual('PerformaceToProfileJoin', { //newly added
    ref: 'USER_PROFILE_COLLECTION',
    localField: 'EMAIL',
    foreignField: 'EMAIL',
    justOne: true 
  });

STUDENT_PERFORMANCE_COLLECTION.index({ EMAIL: 1, QUESTION_ID: 1, CHAPTER_ID: 1, CONCEPT_ID: 1}, { unique: true });
STUDENT_PERFORMANCE_COLLECTION.plugin(uniqueValidator)

module.exports = mongoose.model(
  "STUDENT_PERFORMANCE_COLLECTION",
  STUDENT_PERFORMANCE_COLLECTION
);