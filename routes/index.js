var express = require('express');
var routes = express.Router();
var Quarks = require('../models/Quarks');
var Advertisement = require('../models/Advertisement');
var {IsLoggedIn}=require("../Authentication");
var {checkLogIn}=require("../CheckLogIn");

const COURSE_IMG_COLLECTION = require ("../models/COURSE_IMG_COLLECTION");
const USER_PROFILE_COLLECTION = require ("../models/USER_PROFILE_COLLECTION");
const USER_PREMIUM_COLLECTION = require ("../models/USER_PREMIUM_COLLECTION");

// For Imagine Wizards
const PRODUCTS_COLLECTION = require ("../models/PRODUCTS_COLLECTION");
const WISHLIST_COLLECTION = require ("../models/WISHLIST_COLLECTION");
const CART_COLLECTION = require ("../models/CART_COLLECTION");


const moment=require("moment");

var ip = require('ip');

//Load initial form to take input

//unused api
routes.get('/:userToken', async function (req, res) {
    let allCourses =await COURSE_IMG_COLLECTION.find({});  
    
    if(req.user && req.user.EMAIL) {
        //Fetch User Name
        EmailOrIP = req.user.EMAIL

    let productList=await PRODUCTS_COLLECTION.find({}).limit(4);
    let wishlistProdList = await WISHLIST_COLLECTION.find({USER_IP_OR_EMAIL:EmailOrIP});

    let heartList = [];
    let found = false; 

    for (let i = 0; i<productList.length; i++){
        found = false;
        for (let j = 0; j<productList.length;j++){
            if(productList[i].PROD_ID == wishlistProdList[j].PROD_ID){
                found=true;
                break;
            }
            else
                found = false;
        }
        if(found==true){    
            heartList.push('💚');
        }
        else{
            heartList.push('♡');
        }
    }

    res.render('TempPay', {Courses: allCourses, loginFlag: 0, username: "", Products: productList, heartList:heartList});  
    return;
    }

    if(!(req.user && req.user.EMAIL)){
        EmailOrIP = req.body.userToken
    }
    else 
        EmailOrIP = req.user.EMAIL

    let productList=await PRODUCTS_COLLECTION.find({}).limit(4);
    let wishlistProdList = await WISHLIST_COLLECTION.find({USER_IP_OR_EMAIL:EmailOrIP});

    let heartList = [];
    let found = false; 

    for (let i = 0; i<productList.length; i++){
        found = false;
        for (let j = 0; j<productList.length;j++){
            if(productList[i].PROD_ID == wishlistProdList[j].PROD_ID){
                found=true;
                break;
            }
            else
                found = false;
        }
        if(found==true){    
            heartList.push('💚');
        }
        else{
            heartList.push('♡');
        }
    }

    res.render('TempPay', {Courses: allCourses, loginFlag: 0, username: "", Products: productList, heartList:heartList});  
    return;
})


routes.get('/', async function (req, res) {
    let allCourses =await COURSE_IMG_COLLECTION.find({});  
    
    if(req.user && req.user.EMAIL) {
        //Fetch User Name
        EmailOrIP = req.user.EMAIL

        let productList=await PRODUCTS_COLLECTION.find({}).limit(4);
        
        res.render('TempPay', {Courses: allCourses, loginFlag: 1, username: "", Products: productList});  
        return;
    }

    let productList=await PRODUCTS_COLLECTION.find({}).limit(4);
    // let wishlistProdList = await WISHLIST_COLLECTION.find({USER_IP_OR_EMAIL:EmailOrIP});

    // let heartList = [];
    // let found = false; 

    // for (let i = 0; i<productList.length; i++){
    //     found = false;
    //     for (let j = 0; j<wishlistProdList.length;j++){
    //         if(productList[i].PROD_ID == wishlistProdList[j].PROD_ID){
    //             found=true;
    //             break;
    //         }
    //         else
    //             found = false;
    //     }
    //     if(found==true){    
    //         heartList.push('💚');
    //     }
    //     else{
    //         heartList.push('♡');
    //     }
    // }

    let discount = []
    let discountAmt = 0
    let discountPercent = 0

    for (let i = 0; i<productList.length;i++){
        discountAmt = parseFloat(productList[i].ORIGINAL_PRICE) - parseFloat(productList[i].PRICE)
        discountPercent = Math.round((discountAmt * 100 / parseFloat(productList[i].ORIGINAL_PRICE)))

        discount.push(discountPercent)
    }

    res.render('TempPay', {Courses: allCourses, loginFlag: 0, username: "", Products: productList, discount:discount});  
    return;
})





routes.get('/QuarkX', async function(req, res) {
    if(req.user && req.user.EMAIL) {
        //Fetch User Name
        let userStr = await USER_PROFILE_COLLECTION.findOne({EMAIL:req.user.EMAIL});
        let username = userStr.USERNAME;
        username = username.substr(0, username.indexOf(' '));
        res.render('QuarkX', {loginFlag: 1, username: username});  
        return;
    }
    res.render('QuarkX', {loginFlag: 0, username: ""});  
    return;
})


routes.get('/TermsAndConditions', function(req, res) {
    return res.render('TermsAndConditions');
})

routes.get('/RefundCancellationPolicy', function(req, res) {
    return res.render('RefundCancellationPolicy');
})

routes.get('/PrivacyPolicy', function(req, res) {
    return res.render('PrivacyPolicy');
})

routes.get('/ViewAllCourses', async function(req, res) {

    let allCourses =await COURSE_IMG_COLLECTION.find({});  

    if(req.user && req.user.EMAIL) {
        //Fetch User Name
        let userStr = await USER_PROFILE_COLLECTION.findOne({EMAIL:req.user.EMAIL});
        let username = userStr.USERNAME;
        username = username.substr(0, username.indexOf(' '));
        res.render('ViewAllCourses', {Courses: allCourses, loginFlag: 1, username: username});  
        return;
    }
    res.render('ViewAllCourses', {Courses: allCourses, loginFlag: 0, username: ""});  
    return;
})

routes.get('/index', async function(req, res) {
    if(req.user && req.user.EMAIL) {
        //Fetch User Name
        let userStr = await USER_PROFILE_COLLECTION.findOne({EMAIL:req.user.EMAIL});
        let username = userStr.USERNAME;
        username = username.substr(0, username.indexOf(' '));
        res.render('index', {loginFlag: 1, username: username});  
        return;
    }
    res.render('index', {loginFlag: 0, username: ""});  
    return;
})

routes.get('/AllQuarks', function(req, res) {
    return res.render('AllQuarks');
})

routes.get('/WriteQuarks', function(req, res) {
    return res.render('submitQuarks');
})


routes.get('/GkQuarks', function(req, res) {
    return res.render('GkQuarks');
})

routes.get('/ScienceQuarks', function(req, res) {
    return res.render('ScienceQuarks');
})

routes.get('/MythologyQuarks', function(req, res) {
    return res.render('MythologyQuarks');
})

routes.get('/HistoryQuarks', function(req, res) {
    return res.render('HistoryQuarks');
})

routes.get('/BusinessQuarks', function(req, res) {
    return res.render('BusinessQuarks');
})

routes.get('/MythologyQuarks', function(req, res) {
    return res.render('MythologyQuarks');
})

routes.get('/MathsQuarks', function(req, res) {
    return res.render('MathsQuarks');
})

routes.get('/CampusAmbassador', function(req, res) {
    return res.render('CampusAmbassador');
})

routes.get('/PostQuestions',IsLoggedIn, function(req, res) {
    if(req.user.EMAIL != "abhigyankashyap82@gmail.com") {
        res.send("You are not an admin");
        return;
    }
    return res.render('PostQuestions');
})

// routes.get('/ConceptDashboard',IsLoggedIn, function(req, res) {
//     return res.render('ConceptDashboard');
// })

// routes.get('/ConceptDashboardComplete',IsLoggedIn, function(req, res) {
//     return res.render('ConceptDashboardComplete');
// })

// routes.get('/ChaptersConcepts',IsLoggedIn, function(req, res) {
//     return res.render('ChaptersConcepts');
// })

routes.get('/ResetPassword', function(req, res) {
    return res.render('ResetPassword');
})


routes.get('/Payment', function(req, res) {
    return res.render('Payment');
})

routes.get('/PaymentGithub', IsLoggedIn, function(req, res) {
    return res.render('PaymentGithub');
})

routes.get('/TempPay', async function(req, res) {

    if(req.user && req.user.EMAIL) {
         //Fetch User Name
         let userStr = await USER_PROFILE_COLLECTION.findOne({EMAIL:req.user.EMAIL});
         let username = userStr.USERNAME;
         username = username.substr(0, username.indexOf(' '));
         
         let MyCoursesArr = await USER_PREMIUM_COLLECTION.find({EMAIL:req.user.EMAIL});
 
         if(MyCoursesArr.length == 0) {
             res.send("You have not yet subscribed to any course");
             return;
         }
 
         let availableCourses=[];
         let availableClasses = [];
 
         let currentDateTime = moment(Date.now());
         var timediffinsec;
         let y = 0;
 
         for(let i=0;i<MyCoursesArr.length;i++)
         {
             timediffinsec = parseInt(moment.duration(currentDateTime.diff(MyCoursesArr[i] && MyCoursesArr[i].EXPIRY_DATE_TIME)).asSeconds(),10);
             if(timediffinsec < 0) {
                 availableCourses[y++] = MyCoursesArr[i].COURSE_ID;
                 availableClasses[y++] = MyCoursesArr[i].CLASS_ID;
             }
         }
 
         if(availableCourses.length == 0 || availableClasses.length == 0) {
             res.send("Your Subscription has expired");
             return;
         }
         
         let allCourses =await COURSE_IMG_COLLECTION.find({CLASS_ID: { $in: availableClasses }, COURSE_ID: { $in: availableCourses }});
        
        if (allCourses) {
            res.render('MyCourses',{allCourses:allCourses, username:username});
            return;
        }
        else{
            let allCourses =await COURSE_IMG_COLLECTION.find({});           
            res.render('TempPay', {Courses: allCourses, loginFlag: 1, username:username});        
            return;
        }
    }

    let allCourses =await COURSE_IMG_COLLECTION.find({});   
    res.render('TempPay', {Courses: allCourses, loginFlag: 0, username: ""});  
    return;
})

routes.get('/PaymentSuccess', IsLoggedIn, function(req, res) {
    return res.render('PaymentSuccess');
})

routes.get('/MyCourses', IsLoggedIn, function(req, res) {
    return res.render('MyCourses');
})

routes.get('/signup', IsLoggedIn, function(req, res) {
    return res.render('signup');
})

// routes.get('/SolveQuestions', IsLoggedIn, function(req, res, next) {
//     res.render('SolveQuestions');
// })


module.exports = routes;