const express = require("express");
const router = express.Router();
var USER_PROFILE_COLLECTION= require("../models/USER_PROFILE_COLLECTION");
const COURSE_IMG_COLLECTION = require ("../models/COURSE_IMG_COLLECTION");
var USER_PREMIUM_COLLECTION= require("../models/USER_PREMIUM_COLLECTION");
const moment=require("moment");

router.use(express.json());
const mongoose = require("mongoose");
const passport = require("passport"); 
var UserInfoMap = new Map();
var {ResetPwdRequest,OtpResetRequest,LoginRequest,SignupRequest,OtpSignupRequest}=require("../CommanStructure/AuthParameters");
var {SendOtp,VerifyOtp,generateHash,validPassword}=require("../utils");
const jwt = require('jsonwebtoken');
const Config=require("../config/config");

// For Imagine Wizards
const CART_COLLECTION = require ("../models/CART_COLLECTION");
const PRODUCTS_COLLECTION = require ("../models/PRODUCTS_COLLECTION");
const WISHLIST_COLLECTION = require ("../models/WISHLIST_COLLECTION");


// router.get('/insertJwtforALLUsers', async function(req,res){
//   var User=await USER_PROFILE_COLLECTION.find({}).lean();
//   for(let i=0;i<User.length;i++){
//     let UserTokenPayload={username:User[i].USERNAME}; 
//     let UserJwtToken=jwt.sign(UserTokenPayload,Config.JwtTokenKey); 
//     await USER_PROFILE_COLLECTION.findOneAndUpdate({USERNAME:User[i].USERNAME},
//         {$set: 
//           {TOKEN: UserJwtToken}});
//     }
//   res.send("all token generated");

// });


 router.post("/Signup", async function (req, res, next) {
     try
    {
      // console.log("Request is received for Signup: with Username=" +req.body.usrname);
      var ObjSignupRequest=new SignupRequest(req.body);
        if (req.body && ObjSignupRequest.usrname && ObjSignupRequest.pwd && ObjSignupRequest.cnfpwd && ObjSignupRequest.email && ObjSignupRequest.phnNum) 
        {

            if(!(ObjSignupRequest.pwd===ObjSignupRequest.cnfpwd))
            {
               // res.status(200).json({ ErrCode: 1, ResMsg: "Password and Confirm Password mismatch" });
               res.render('signupErr', {ErrCode: 1, ResMsg: "Password and Confirm Password mismatch"}); 
               return;
            }
           // if(!ObjSignupRequest.pwd.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) //thik karna
           if(!(ObjSignupRequest.pwd.length<=8))
            {
                //res.status(200).json({ ErrCode: 4, ResMsg: "Password must be minimum eight characters long,at least one letter and one number." });
                // res.render('signupErr', {ErrCode: 4, ResMsg: "Password must be minimum 8 characters long, at least 1 letter and 1 number."}); 
                res.render('signupErr', {ErrCode: 4, ResMsg: "Password must be minimum 8 characters long."}); 
                return;
            }
            try
            {    
                var User=await USER_PROFILE_COLLECTION.findOne({EMAIL:ObjSignupRequest.email});
                if(User)
                {
                    //res.status(200).json({ ErrCode: 2, ResMsg: "Email is already exist."});
                    res.render('signupErr', {ErrCode: 2, ResMsg: "Email already exists. Try resetting Password"}); 
                    return;
                }
                
              let bret= await SendOtp(ObjSignupRequest.email,'Registration');
              if(bret)
              {
              UserInfoMap.set(ObjSignupRequest.email,JSON.stringify(ObjSignupRequest));
              
              //res.status(200).json({ ErrCode: 0, ResMsg: "Otp send successfully"});
              res.render('VerifyOtp',{Message:"VERIFY OTP TO REGISTER ",email:ObjSignupRequest.email});
              return;
              }
              else
              {
              //res.status(200).json({ ErrCode: 2, ResMsg: 'Otp sending failed'});
              res.render('signupErr', {ErrCode: 2, ResMsg: "Otp sending failed"}); 
              return;
              }
              }
            catch(err)
            {
                // console.log("DB Connection Error in Signup request: "+err.message);
                res.status(200).json({ ErrCode: 7, ResMsg: "DB Connection Error" });
                return;
            }
        }
        else
        {
            res.status(200).json({ ErrCode: 3, ResMsg: "Invalid Request Parameter."});
            return;
        }
    }
    catch(err)
    {
        // console.log("Error in Signup route-" + err.message);
        res.status(500).json({ ErrCode: 9999, ResMsg: "Exception Occured" });
        return;
    }
  });

  router.post("/OtpSignup", async function (req, res, next) {
    
    try
    {
      req.body.otp = req.body.digit1 + req.body.digit2 + req.body.digit3 + req.body.digit4 + req.body.digit5 + req.body.digit6;

      // console.log("Request is received for OtpSignup: with OTP=" +req.body.otp);
      var ObjOtpSignupRequest=new OtpSignupRequest(req.body);
      
      if (req.body && ObjOtpSignupRequest.otp && ObjOtpSignupRequest.email) 
      {
        if(!VerifyOtp(ObjOtpSignupRequest.email,ObjOtpSignupRequest.otp))
        {
          //res.status(200).json({ ErrCode: 1, ResMsg: "Registration failed."});
          res.render('signupErr', {ErrCode: 0, ResMsg: "Registration failed. Try Again."});  
          return;
        }
       let DBData=JSON.parse(UserInfoMap.get(ObjOtpSignupRequest.email));
       try
       {
        
       let UserTokenPayload={username:DBData.usrname}; 
       let UserJwtToken=jwt.sign(UserTokenPayload,Config.JwtTokenKey); 
       let objUser=new USER_PROFILE_COLLECTION({
         USERNAME:DBData.usrname,
         PASSWORD:generateHash(DBData.pwd),
         EMAIL:DBData.email,
         PHONE_NUM: DBData.phnNum2, 
         TOKEN:UserJwtToken
        });
        await objUser.save();
        //res.status(200).json({ ErrCode: 0, ResMsg: "Registration Successful."});
        res.render('signupErr', {ErrCode: 0, ResMsg: "Registration Successful. Please Sign In."});  
        return;
      }

      catch(err)
      {
        // console.log("DB Connection Error in OtpSignup request: "+err.message);
        res.status(200).json({ ErrCode: 7, ResMsg: "DB Connection Error"});
        return;
      }

      }
      else
      {
        res.status(200).json({ ErrCode: 3, ResMsg: "Invalid Request Parameter."});
        return;
      }
    }
    catch(err)
    {
      // console.log("Error in OtpSignup route-" + err.message);
      res.status(500).json({ ErrCode: 9999, ResMsg: "Exception Occured" });
      return;
    }

  });
 

  router.post("/ResetPassword", async function (req, res, next) {
    
    try
    {
      console.log("Request is received for ResetPassword: with Username=" +req.body.email);
      var ObjResetPwdRequest=new ResetPwdRequest(req.body);
      if (ObjResetPwdRequest.email && ObjResetPwdRequest.newpwd && ObjResetPwdRequest.newcnfpwd) 
      {
        if(!(ObjResetPwdRequest.newpwd==ObjResetPwdRequest.newcnfpwd))
        {
          // res.json({ ErrCode: 1, ResMsg: "Password and Confirm Password mismatch" });
          res.render('signupErr', {ErrCode: 1, ResMsg: "Password and Confirm Password mismatch"});  
          return;
        }
        if(!ObjResetPwdRequest.newpwd.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/))
        {
          //  res.json({ ErrCode: 4, ResMsg: "Password must be minimum eight characters long,at least one letter and one number." });
          res.render('signupErr', {ErrCode: 4, ResMsg: "Password must be minimum 8 characters long, at least 1 letter and 1 number."}); 
          return;
        }
        try
        {
         let User=await USER_PROFILE_COLLECTION.findOne({EMAIL:ObjResetPwdRequest.email});
         if(!User)
         {
         // res.json({ ErrCode: 2, ResMsg: "Username not found." });
         res.render('signupErr', {ErrCode: 2, ResMsg: "Email ID is not registered with QuarkX"});  
         return;
         }
         let objOtpRequest={};
         objOtpRequest.email=User.EMAIL;
      

          let bret= await SendOtp(objOtpRequest.email,'Password Reset');
          if(bret)
          {
          UserInfoMap.set(ObjResetPwdRequest.email,JSON.stringify(ObjResetPwdRequest));
          
          //res.status(200).json({ ErrCode: 0, ResMsg: 'Otp sent successfully.'});
          res.render('ForgotPwdResetOtp',{Message:"VERIFY OTP TO CHANGE PASSWORD ",email:ObjResetPwdRequest.email, newpwd:ObjResetPwdRequest.newpwd, newcnfpwd:ObjResetPwdRequest.newcnfpwd});
          //Abhigyan Trying
          return;
          }
          else
          {
          //res.status(200).json({ ErrCode: 5, ResMsg: 'Password Reset Failed'});
         res.render('signupErr', {ErrCode: 2, ResMsg: "Password Reset Failed"});  
          return;
          }
          }
         catch(err)
        {
          console.log("DB Connection Error in ResetPassword request: "+err.message);
          res.status(500).json({ ErrCode: 7, ResMsg: "DB Connection Error"});
          return;
        }
      }
      else
      {
        res.json({ ErrCode: 3, ResMsg: "Invalid Request Parameter."});
        return;
      }
    }
    catch(err)
    {
      console.log("Error in ResetPassword route-" + err.message);
      res.status(500).json({ ErrCode: 9999, ResMsg: "Exception Occured" });
      return;
    }
  });

/////need to blacklist token on Otpresetpassword if present
  router.post("/OtpResetPassword", async function (req, res, next) {
   
    try
    {
      req.body.otp = req.body.digit1 + req.body.digit2 + req.body.digit3 + req.body.digit4 + req.body.digit5 + req.body.digit6;

      console.log("Request is received for OtpResetPassword: with Username=" +req.body.email);
      var ObjOtpResetRequest=new OtpResetRequest(req.body);
      if (req.body && ObjOtpResetRequest.otp && ObjOtpResetRequest.email) 
      {
        if(!VerifyOtp(ObjOtpResetRequest.email,ObjOtpResetRequest.otp))
        {
          //res.status(200).json({ ErrCode: 1, ResMsg: "Password reset failed."});
          res.render('signupErr', {ErrCode: 2, ResMsg: "Wrong OTP Entered. Password reset failed. Please try again"});  
          return;
        }
       let MapData=JSON.parse(UserInfoMap.get(ObjOtpResetRequest.email));
       try
       {
        
        await USER_PROFILE_COLLECTION.findOneAndUpdate({EMAIL:MapData.email},{$set: {PASSWORD:generateHash(MapData.newpwd)}},{new:true});
        //res.status(200).json({ ErrCode: 0, ResMsg: "Password successfully reset."});
        res.render('signupErr', {ErrCode: 2, ResMsg: "Password successfully reset. Please Log In"});  
        return;
      }

      catch(err)
      {
        console.log("DB Connection Error in OtpResetPassword request: "+err.message);
        res.status(200).json({ ErrCode: 7, ResMsg: "DB Connection Error"});
        return;
      }

      }
      else
      {
        res.status(200).json({ ErrCode: 3, ResMsg: "Invalid Request Parameter."});
        return;
      }
    }
    catch(err)
    {
      console.log("Error in OtpResetPassword route-" + err.message);
      res.status(500).json({ ErrCode: 9999, ResMsg: "Exception Occured" });
      return;
    }

  });

  router.post("/Login",passport.authenticate('local'), async function (req, res) {
     // res.status(200).json({Errcode:0,ResMsg: 'You are successfully logged in!'});
        
     try{
         //Fetch User Name
         req.body.userToken = '1672768801125'
         await CART_COLLECTION.updateMany({USER_IP_OR_EMAIL: req.body.userToken}, {$set: {USER_IP_OR_EMAIL: req.user.EMAIL}})
 
         let productList=await PRODUCTS_COLLECTION.find({});
         let wishlistProdList = await WISHLIST_COLLECTION.find({USER_IP_OR_EMAIL:req.user.EMAIL});
     
         let heartList = [];
         let found = false; 
     
         for (let i = 0; i<productList.length; i++){
             found = false;
             for (let j = 0; j<wishlistProdList.length;j++){
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

         res.render('TempPay', {Courses: "",loginFlag:"",username:"",Products: productList, heartList:heartList});  
      
      }
      

      catch(err){
        res.render('error');
      }

    });
        
  router.get('/Logout',async function(req,res){
    try
    {
    await req.session.destroy();
   // res.status(200).json({Errcode:0,ResMsg:"you have successfully Logged out"});
   //res.render('signupErr', {ErrCode: 2, ResMsg: "You have successfully Logged Out"});  
   //logger.info(`${req.baseUrl+req.url} api response-${req.user && req.user.username} have successfully logged out`);
      
      // commented for imagine wizards
    // let allCourses =await COURSE_IMG_COLLECTION.find({});   
    //   res.render('TempPay', {Courses: allCourses, loginFlag: 0, username: ""}); 
    res.send("you are logged out") 
      return;
    }
    catch(err)
    {
        //res.json({Errcode:2,ResMsg:err.message});
       // logger.info(`${req.baseUrl+req.url} api error-${err.message}`);
        res.render('error');
    }
   });


module.exports = router;