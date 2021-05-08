const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Quarks = new Schema({
    QuarkTitle: {
        type: String,
        required: true
    },
    QuarkText: {
        type: String,
        required: true
    },
    QuarkImage: {
        type: String,
        required: true
    },
    Subject: {
        type: String,
        required: true
    },
    Author: {
        type: String,
        required: true
    }
}, { versionKey: false });

module.exports = mongoose.model('Quarks', Quarks);