var mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');
var DateOnly = require('mongoose-dateonly')(mongoose);
var Schema = mongoose.Schema;


var USER_TIMER_COLLECTION = new Schema({

    EMAIL: {
        type: String,
        required: true
      },
    DATE:{
        type: DateOnly,
        default:Date.now
    },
    START_TIME:{
        type:Date,
        required:true,
        default:Date.now
    },
    END_TIME:{
        type:Date,
        required:true,
        default:Date.now

    },
    
});

USER_TIMER_COLLECTION.index({ EMAIL: 1, DATE: 1}, { unique: true });
USER_TIMER_COLLECTION.plugin(uniqueValidator)

module.exports = mongoose.model(
  "USER_TIMER_COLLECTION",
  USER_TIMER_COLLECTION
);