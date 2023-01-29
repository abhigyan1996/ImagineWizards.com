var mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator')
var Schema = mongoose.Schema;

var autoIncrement = require("mongoose-auto-increment");
// var MongoDbConn = require("../DataBase/MongoDbConn");
// var cMongoDbConn = new MongoDbConn('QuarkXDatabase').getInstance();
var {MongoDbConn}=require("../server");
autoIncrement.initialize(MongoDbConn.connect);

var COUPONS_COLLECTION = new Schema({

    COUPON_ID: {
        type: String,
        required:true
    },
    VALIDITY: {
        type: String,
        required:true
    },
    DISCOUNT_RANGE_1: {
        type:String,
        required:true  
    },
    DISCOUNT_RANGE_2: {
        type:String,
        required:true  
    },
    DISCOUNT_RANGE_3: {
        type:String,
        required:true  
    },
    MIN_CART_VALUE: {
        type: String,
        required:true
    },
    CART_VAL_RANGE_2: {
        type: String,
        required:true
    },
    CART_VAL_RANGE_3: {
        type: String,
        required:true
    },
    MAX_DISCOUNT: {
        type: String,
        required:true
    }
});

COUPONS_COLLECTION.index({COUPON_ID: 1}, { unique: true });
COUPONS_COLLECTION.plugin(uniqueValidator)

module.exports = mongoose.model(
  "COUPONS_COLLECTION",
  COUPONS_COLLECTION
);