var mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator')
var Schema = mongoose.Schema;
var autoIncrement = require("mongoose-auto-increment");
// var MongoDbConn = require("../DataBase/MongoDbConn");
// var cMongoDbConn = new MongoDbConn('QuarkXDatabase').getInstance();
var {MongoDbConn}=require("../server");
autoIncrement.initialize(MongoDbConn.connect);

var ALL_QUESTIONS_COLLECTION = new Schema({

    CLASS_ID:{
        type:String,
        required:true,
        default:"others"
    },
    COURSE_ID:{
        type:String,
        required:true,
        default:"others"
    },
    CHAPTER_ID:{
        type:String,
        required:true,
        default:"others"
    },
    CONCEPT_ID:{
        type:String,
        required: true
    },
    QUESTION:{
        type:String,
        required:true
    },
    Q_IMG:{
        type:String
    },
    OptionA:{
        type:String,
        required: true
    },
    OptionB:{
        type:String,
        required: true
    },
    OptionC:{
        type:String,
        required: true
    },
    OptionD:{
        type:String,
        required: true
    },
    CORRECT_OPT:{
        type: String,
        required: true
    },
    EXPLANATION:{
        type: String,
        required: true
    },
    EXPLANATION_IMAGE:{
        type: String,
    },
    SCORE:{
        type: Number,
        default:1
    },
    QUESTION_IMG_FLAG:{
        type: Number,
        max:1,
        min:0,
        default:0
    },
    ANS_IMG_FLAG:{
        type: Number,
        max:1,
        min:0,
        default:0
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

ALL_QUESTIONS_COLLECTION.plugin(autoIncrement.plugin, {
    model: "ALL_QUESTIONS_COLLECTION",
    field: "QUESTION_ID",
    startAt: 1,
  });

ALL_QUESTIONS_COLLECTION.plugin(uniqueValidator)
module.exports = mongoose.model(
  "ALL_QUESTIONS_COLLECTION",
  ALL_QUESTIONS_COLLECTION
);