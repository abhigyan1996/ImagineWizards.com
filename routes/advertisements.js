var express = require('express');
var advertisementRoutes = express.Router();
var Advertisement = require('../models/Advertisement');

// Get API START <----------------->

advertisementRoutes.get('/', function (req, res) {
    return res.render('advertisement');
});

advertisementRoutes.get('/getAll', function (req, res) {
    Advertisement.find(function (err, advertisement) {
        if (err) {
            console.log(err);
        } else {
            res.status(200).json({ "Advertisement": advertisement });
        }
    });
});

advertisementRoutes.get('/:id', function (req, res) {
    let id = req.params.id;
    Advertisement.findById(id, function (err, advertisement) {
        res.status(200).json(advertisement);
    });
});

// GET API END <----------------->


//POST API START <---------------> 
advertisementRoutes.post('/add', function (req, res) {
    let advertisement = new Advertisement(req.body);
    advertisement.save(function (err, data) {
        if (err) throw err;
        console.log("Record inserted Successfully");

    });
    return res.render('success', { 'message': 'Advertisement' });
})

advertisementRoutes.post('/update/:id', function (req, res) {
    Advertisement.findById(req.params.id, function (err, advertisement) {
        if (!advertisement)
            res.status(404).send('data is not found');
        else {
            advertisement.QuarkAdLink = req.body.QuarkAdLink ? req.body.QuarkAdLink : advertisement.QuarkAdLink;
            advertisement.save().then(advertisement => {
                res.status(200).json('Quark updated');
            }).catch(err => {
                res.status(400).send("Update not possible");
            });
        }
    });
});

//POST API END <--------------->
module.exports = advertisementRoutes;