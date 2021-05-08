const express = require('express');
const axios = require('axios')
const quarkRoutes = express.Router();
const Quarks = require('../models/Quarks');
//const BASE_URL = "https://quarkx.herokuapp.com/api/quark/"
const BASE_URL = "https://quarkx.herokuapp.com/api"

// Get API START <----------------->

quarkRoutes.get('/', function (req, res) {
    let subject = req.query.subject;
    axios.get(BASE_URL, {
        params: { "subject": subject }
    }
    ).then(function (response) {
        if (subject != null) {
            return res.render('AllQuarks', { data: response.data.Quarks });
        } else {
            return res.render('QuarkX');
        }
    }).catch(function (error) {
        throw new Error(error)
    })
});

quarkRoutes.get('/all', function (req, res) {
    axios.get(BASE_URL)
        .then(function (response) {
            return res.render('AllQuarks', { data: response.data.Quarks });
        }).catch(function (error) {
            throw new Error(error)
        })
});

quarkRoutes.get('/submitQuarks', function (req, res) {
    return res.render('submitQuarks');
});


// GET API END <----------------->


//POST API START <---------------> 
quarkRoutes.post('/add', function (req, res) {
    let quarkx = new Quarks(req.body);
    quarkx.save(function (err, data) {
        if (err) throw err;
        console.log("Record inserted Successfully");

    });
    return res.render('success', { 'message': 'Quarks' });
})

quarkRoutes.post('/update/:id', function (req, res) {
    Quarks.findById(req.params.id, function (err, quarkx) {
        if (!quarkx)
            res.status(404).send('data is not found');
        else {
            quarkx.QuarkTitle = req.body.QuarkTitle ? req.body.QuarkTitle : quarkx.QuarkTitle;
            quarkx.QuarkText = req.body.QuarkText ? req.body.QuarkText : quarkx.QuarkText;
            quarkx.QuarkImage = req.body.QuarkImage ? req.body.QuarkImage : quarkx.QuarkImage;
            quarkx.Subject = req.body.Subject ? req.body.Subject : quarkx.Subject;
            quarkx.Author = req.body.Author ? req.body.Author : quarkx.Author;

            quarkx.save().then(quarkx => {
                res.status(200).json('Quark updated');
            }).catch(err => {
                res.status(400).send("Update not possible");
            });
        }
    });
});

//POST API END <--------------->
module.exports = quarkRoutes;