var express = require('express');
var routes = express.Router();
var Quarks = require('../models/Quarks');
var Advertisement = require('../models/Advertisement');
var {IsLoggedIn}=require("../Authentication");

const All_QUESTIONS_COLLECTION = require("../models/ALL_QUESTIONS_COLLECTION");

//Load initial form to take input
routes.get('/', function (req, res) {
    return res.render('signup');
})

routes.get('/QuarkX', function(req, res) {
    return res.render('QuarkX');
})

routes.get('/QuarkXAcademy',IsLoggedIn, function(req, res) {
    return res.render('QuarkXAcademy');
})

routes.get('/PostQuestions',IsLoggedIn, function(req, res) {
    if(req.user.EMAIL != "abhigyankashyap82@gmail.com") {
        res.send("You are not an admin");
        return;
    }
    return res.render('PostQuestions');
})

routes.get('/ConceptDashboard',IsLoggedIn, function(req, res) {
    return res.render('ConceptDashboard');
})

routes.get('/ConceptDashboardComplete',IsLoggedIn, function(req, res) {
    return res.render('ConceptDashboardComplete');
})

routes.get('/ChaptersConcepts',IsLoggedIn, function(req, res) {
    return res.render('ChaptersConcepts');
})

routes.get('/ResetPassword', function(req, res) {
    return res.render('ResetPassword');
})


routes.get('/Payment', function(req, res) {
    return res.render('Payment');
})

routes.get('/PaymentGithub', IsLoggedIn, function(req, res) {
    return res.render('PaymentGithub');
})

routes.get('/TempPay', IsLoggedIn, function(req, res) {
    return res.render('TempPay');
})

routes.get('/PaymentSuccess', IsLoggedIn, function(req, res) {
    return res.render('PaymentSuccess');
})

routes.get('/MyCourses', IsLoggedIn, function(req, res) {
    return res.render('MyCourses');
})

routes.get('/SolveQuestions', IsLoggedIn, function(req, res, next) {
    // All_QUESTIONS_COLLECTION.find()
    // .then(result => {
    //     res.status(200).json({
    //         questionsData:result
    //     });
    // })
    // .catch (err=>{
    //     console.log(err);
    // })
    res.render('SolveQuestions');
})


module.exports = routes;