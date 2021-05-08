var mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator')
var Schema = mongoose.Schema;

var USER_PREMIUM_COLLECTION = new Schema({

EMAIL: {
    type: String,
    required: true
  },
TRIAL_FLAG:{
    type:Number,
    default:0,
    min:0,
    max:1
},
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
EXPIRY_DATE_TIME:{
    type:Date,
    default:null  
}

});
USER_PREMIUM_COLLECTION.index({ EMAIL: 1,CLASS_ID: 1,COURSE_ID:1}, { unique: true });
USER_PREMIUM_COLLECTION.plugin(uniqueValidator)

module.exports = mongoose.model(
  "USER_PREMIUM_COLLECTION",
  USER_PREMIUM_COLLECTION
);