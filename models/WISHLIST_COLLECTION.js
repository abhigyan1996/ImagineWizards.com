var mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator')
var Schema = mongoose.Schema;

var autoIncrement = require("mongoose-auto-increment");
// var MongoDbConn = require("../DataBase/MongoDbConn");
// var cMongoDbConn = new MongoDbConn('QuarkXDatabase').getInstance();
var {MongoDbConn}=require("../server");
autoIncrement.initialize(MongoDbConn.connect);

var WISHLIST_COLLECTION = new Schema({

    USER_IP_OR_EMAIL: {
        type: String,
        required:true
    },
    PROD_ID: {
        type: String,
        required:true
    },
    ROW_INSERTION_DATE_TIME:{
        type: Date,
        default:Date.now,
        required: true
    },
},{toObject: {virtuals:true},toJSON:true,collection:"WISHLIST_COLLECTION"});

WISHLIST_COLLECTION.virtual('WishlistToProductJoin', {
    ref: 'PRODUCTS_COLLECTION',
    localField: 'PROD_ID',
    foreignField: 'PROD_ID',
    justOne: true 
  });


  WISHLIST_COLLECTION.index({USER_IP_OR_EMAIL: 1,PROD_ID:1},{ unique: true });
  WISHLIST_COLLECTION.plugin(uniqueValidator)

module.exports = mongoose.model(
  "WISHLIST_COLLECTION",
  WISHLIST_COLLECTION
);