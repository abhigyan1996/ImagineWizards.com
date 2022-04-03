var mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator')
var Schema = mongoose.Schema;

var USER_PROFILE_COLLECTION = new Schema({
  USERNAME: {
    type: String,
    required: true,
  },
  PASSWORD: {
    type: String,
    required: true,
  },
  EMAIL: {
    type: String,
    required: true,
    unique: true,
  },
  ROW_INSERTION_DATE_TIME:{
    type: Date,
    default:Date.now
},
PREMIUM_FLAG:{
    type:Number,
    default:0,
    min:0,
    max:1
},
PHONE_NUM:{
    type:String
},
INFLUENCER_FLAG:{
    type:Number,
    default:0,
    min:0,
    max:1
},
TOKEN:{
  type: String,
  required: true
}
});

USER_PROFILE_COLLECTION.plugin(uniqueValidator)
module.exports = mongoose.model(
  "USER_PROFILE_COLLECTION",
  USER_PROFILE_COLLECTION
);