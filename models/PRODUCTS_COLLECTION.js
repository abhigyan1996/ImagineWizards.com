var mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator')
var Schema = mongoose.Schema;

var autoIncrement = require("mongoose-auto-increment");
// var MongoDbConn = require("../DataBase/MongoDbConn");
// var cMongoDbConn = new MongoDbConn('QuarkXDatabase').getInstance();
var {MongoDbConn}=require("../server");
autoIncrement.initialize(MongoDbConn.connect);

var PRODUCTS_COLLECTION = new Schema({

    PROD_ID: {
        type: String,
        required:true
    },
    PROD_TITLE: {
        type: String,
        required:true
    },
    PROD_IMG1: {
        type:String,
        required:true  
    },
    PROD_IMG2: {
        type: String,
        required:true
    },
    PROD_IMG3: {
        type: String,
        required:true
    },
    PROD_IMG4: {
        type: String,
        required:true
    },
    PROD_IMG5: {
        type: String,
        required:true
    },
    PROD_IMG6: {
        type: String,
        required:true
    },
    PROD_DESC: {
        type: String,
        required:true
    },
    PROD_THEME: {
        type: String,
        required:true
    },
    SIMILAR_PRODS: {
        type: String,
        required:true
    },
    PRICE: {
        type: Number,
        required: true,
        default:0
    },
    ORIGINAL_PRICE: {
        type: Number,
        required: true,
        default:0
    }

});

// PRODUCTS_COLLECTION.plugin(autoIncrement.plugin, {
//     model: "PRODUCTS_COLLECTION",
//     field: "PROD_ID",
//     startAt: 1,
//   });

PRODUCTS_COLLECTION.index({PROD_ID: 1}, { unique: true });
PRODUCTS_COLLECTION.plugin(uniqueValidator)

module.exports = mongoose.model(
  "PRODUCTS_COLLECTION",
  PRODUCTS_COLLECTION
);