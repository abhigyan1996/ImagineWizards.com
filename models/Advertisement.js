const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Advertisement = new Schema({
    QuarkAdLink: {
        type: String,
        required: true
    }
}, { versionKey: false });

module.exports = mongoose.model('Advertisement', Advertisement);