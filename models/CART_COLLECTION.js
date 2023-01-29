var mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator')
var Schema = mongoose.Schema;

var autoIncrement = require("mongoose-auto-increment");
// var MongoDbConn = require("../DataBase/MongoDbConn");
// var cMongoDbConn = new MongoDbConn('QuarkXDatabase').getInstance();
var {MongoDbConn}=require("../server");
autoIncrement.initialize(MongoDbConn.connect);

var CART_COLLECTION = new Schema({

    USER_IP_OR_EMAIL: {
        type: String,
        required:true
    },
    PROD_ID: {
        type: String,
        required:true
    },
    QUANTITY: {
        type:String,
        required:true  
    },
    SIZE: {
        type:String,
        required:true  
    },
    ROW_INSERTION_DATE_TIME:{
        type: Date,
        default:Date.now
    },
},{toObject: {virtuals:true},toJSON:true,collection:"CART_COLLECTION"});

CART_COLLECTION.virtual('CartToProductJoin', {
    ref: 'PRODUCTS_COLLECTION',
    localField: 'PROD_ID',
    foreignField: 'PROD_ID',
    justOne: true 
  });


CART_COLLECTION.index({USER_IP_OR_EMAIL: 1,PROD_ID:1, SIZE:1},{ unique: true });
CART_COLLECTION.plugin(uniqueValidator)

module.exports = mongoose.model(
  "CART_COLLECTION",
  CART_COLLECTION
);