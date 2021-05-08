const express = require("express");
const router = express.Router();
//var logger = require("../logger");
var config = require("../Constants/config");
var PL_IRIS_USERS_COLLECTION = require("../models/PL_IRIS_USERS_COLLECTION");
var PL_IRIS_BLACKLIST_TOKEN_COLLECTION=require('../models/PL_IRIS_BLACKLIST_TOKEN_COLLECTION');
router.use(express.json());
const mongoose = require("mongoose");
const moment=require('moment');
var Utils=require('../Utils');
var CUtils=new Utils();
var UserInfoMap = new Map();
//var {GenerateJWTTokens,generateHash,validPassword,ExtractToken,CheckTokenValidation,SendOtp,VerifyOtp} = require("../Authentication");
var {ResetPwdRequest,OtpResetRequest,LoginRequest,SignupRequest,OtpSignupRequest}=require("../CommanStructres/AuthParameters");

 router.post("/Signup", async function (req, res, next) {
     try
    {
      logger.info("Request is received for Signup: with Username=" +req.body.usrname);
      var ObjSignupRequest=new SignupRequest(req.body);
        if (req.body && ObjSignupRequest.usrname && ObjSignupRequest.pwd && ObjSignupRequest.cnfpwd && ObjSignupRequest.mobnum) 
        {

            if(!(ObjSignupRequest.pwd===ObjSignupRequest.cnfpwd))
            {
                res.status(200).json({ ErrCode: 1, ResMsg: "Password and Confirm Password mismatch" });
                return;
            }
            if(!ObjSignupRequest.pwd.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/))
            {
                res.status(200).json({ ErrCode: 4, ResMsg: "Password must be minimum eight characters long,at least one letter and one number." });
                return;
            }
            try
            {    
                var User=await PL_IRIS_USERS_COLLECTION.findOne({ $or:[{USERNAME:ObjSignupRequest.usrname},{MOBILE_NUMBER:ObjSignupRequest.mobnum}]});
                if(User)
                {
                    res.status(200).json({ ErrCode: 2, ResMsg: "Username or mobile number already exist."});
                    return;
                }
                
              let message= await SendOtp(ObjSignupRequest,true,false);
              if(message==='Otp sent successfully.')
              {
              UserInfoMap.set(ObjSignupRequest.mobnum,JSON.stringify(ObjSignupRequest));
              
              res.status(200).json({ ErrCode: 0, ResMsg: message});
              return;
              }
              res.status(200).json({ ErrCode: 2, ResMsg: 'Mobile number is not valid.'});
              return;
              }
            catch(err)
            {
                logger.info("DB Connection Error in Signup request: "+err.message);
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
        logger.info("Error in Signup route-" + err.message);
        res.status(500).json({ ErrCode: 9999, ResMsg: "Exception Occured" });
        return;
    }
  });

  router.post("/OtpSignup", async function (req, res, next) {
    
    try
    {
      logger.info("Request is received for OtpSignup: with OTP=" +req.body.otp);
      var ObjOtpSignupRequest=new OtpSignupRequest(req.body);
      
      if (req.body && ObjOtpSignupRequest.otp && ObjOtpSignupRequest.mobnum) 
      {
        if(!VerifyOtp(ObjOtpSignupRequest,true,false))
        {
          res.status(200).json({ ErrCode: 1, ResMsg: "Registration failed."});
          return;
        }
       let DBData=JSON.parse(UserInfoMap.get(ObjOtpSignupRequest.mobnum));
       try
       {
       let objUser=new PL_IRIS_USERS_COLLECTION({
         USERNAME:DBData.usrname,
         PASSWORD:generateHash(DBData.pwd),
         MOBILE_NUMBER:DBData.mobnum
        });
        await objUser.save();
        res.status(200).json({ ErrCode: 0, ResMsg: "Registration Successful."});
        return;
      }

      catch(err)
      {
        logger.info("DB Connection Error in OtpSignup request: "+err.message);
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
      logger.info("Error in OtpSignup route-" + err.message);
      res.status(500).json({ ErrCode: 9999, ResMsg: "Exception Occured" });
      return;
    }

  });
 

  router.post("/ResetPassword", async function (req, res, next) {
    
    try
    {
      logger.info("Request is received for ResetPassword: with Username=" +req.body.usrname);
      var ObjResetPwdRequest=new ResetPwdRequest(req.body);
      if (ObjResetPwdRequest.usrname && ObjResetPwdRequest.newpwd && ObjResetPwdRequest.newcnfpwd) 
      {
        if(!(ObjResetPwdRequest.newpwd==ObjResetPwdRequest.newcnfpwd))
        {
            res.json({ ErrCode: 1, ResMsg: "Password and Confirm Password mismatch" });
            return;
        }
        if(!ObjResetPwdRequest.newpwd.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/))
        {
            res.json({ ErrCode: 4, ResMsg: "Password must be minimum eight characters long,at least one letter and one number." });
            return;
        }
        try
        {
         let User=await PL_IRIS_USERS_COLLECTION.findOne({USERNAME:ObjResetPwdRequest.usrname});
         if(!User)
         {
          res.json({ ErrCode: 2, ResMsg: "Username not found." });
          return;
         }
         let objOtpRequest={};
         objOtpRequest.mobnum=User.MOBILE_NUMBER;
         objOtpRequest.usrname=ObjResetPwdRequest.usrname;

          let message= await SendOtp(objOtpRequest,false,true);
          if(message==='Otp sent successfully.')
          {
          UserInfoMap.set(ObjResetPwdRequest.usrname,JSON.stringify(ObjResetPwdRequest));
          
          res.status(200).json({ ErrCode: 0, ResMsg: 'Otp sent successfully.'});
          return;
          }
          res.status(200).json({ ErrCode: 5, ResMsg: 'Password Reset Failed'});
          return;
          }
         catch(err)
        {
          logger.info("DB Connection Error in ResetPassword request: "+err.message);
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
      logger.info("Error in ResetPassword route-" + err.message);
      res.status(500).json({ ErrCode: 9999, ResMsg: "Exception Occured" });
      return;
    }
  });

/////need to blacklist token on Otpresetpassword if present
  router.post("/OtpResetPassword", async function (req, res, next) {
   
    try
    {
      logger.info("Request is received for OtpResetPassword: with Username=" +req.body.usrname);
      var ObjOtpResetRequest=new OtpResetRequest(req.body);
      if (req.body && ObjOtpResetRequest.otp && ObjOtpResetRequest.usrname) 
      {
        if(!VerifyOtp(ObjOtpResetRequest,false,true))
        {
          res.status(200).json({ ErrCode: 1, ResMsg: "Password reset failed."});
          return;
        }
       let MapData=JSON.parse(UserInfoMap.get(ObjOtpResetRequest.usrname));
       try
       {
        
        await PL_IRIS_USERS_COLLECTION.findOneAndUpdate({USERNAME:MapData.usrname},{$set: {PASSWORD:generateHash(MapData.newpwd),IS_LODDEDIN:false}},{new:true});
        res.status(200).json({ ErrCode: 0, ResMsg: "Password successfully reset."});
        return;
      }

      catch(err)
      {
        logger.info("DB Connection Error in OtpResetPassword request: "+err.message);
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
      logger.info("Error in OtpResetPassword route-" + err.message);
      res.status(500).json({ ErrCode: 9999, ResMsg: "Exception Occured" });
      return;
    }

  });

  router.post("/Login", async function (req, res, next) {
    try {
      logger.info("Request is received for Login: with Username=" +req.body.usrname);
      var IsLoggedIn=false;
      var ObjLoginRequest= new LoginRequest(req.body);
      if (!(req.body && ObjLoginRequest.usrname && ObjLoginRequest.pwd)) {
        res.json({ ErrCode: 4, ResMsg: "Invalid Request Parameter."});
        return;
      }
      try
      {
      var User=await PL_IRIS_USERS_COLLECTION.findOne({USERNAME: ObjLoginRequest.usrname});
      }
      catch(err)
      {
        logger.info("DB Connection Error in Login request: "+err.message);
        res.status(200).json({ ErrCode: 7, ResMsg: "DB Connection Error"});
        return;
      }
      if(!User)
      {
        res.json({ ErrCode: 1, ResMsg: "Username not found."});
        return;
      }
      else if(!validPassword(ObjLoginRequest.pwd,User.PASSWORD))
      {
        res.json({ ErrCode: 2, ResMsg: "Password is not valid."});
        return;
      }
      IsLoggedIn=User && User.IS_LODDEDIN;
      if(CUtils.DateDiffInSec(moment(User.TOKEN_EXPIRY_TIME),moment(new Date))<=0)
      {
        IsLoggedIn=false;
      }
      if(IsLoggedIn)
      {
        res.json({ ErrCode: 3, ResMsg: "User already LoggedIn."});
        return;
      }

      let TokenExpiry=CUtils.GetTokenExpiry(); 
      let TokenId=CUtils.CreateUniqueId();
      try
      {
      await PL_IRIS_USERS_COLLECTION.findOneAndUpdate({ USERNAME: ObjLoginRequest.usrname},{$set: {IS_LODDEDIN:true,TOKEN_EXPIRY_TIME:TokenExpiry}});
      }
      catch(err)
      {
        logger.info("DB Connection Error in Login request: "+err.message);
        res.status(200).json({ ErrCode: 7, ResMsg: "DB Connection Error"});
        return;
      }
      let accesstoken = GenerateJWTTokens({username:ObjLoginRequest.usrname,token_id:TokenId});
      res.status(200).json({ErrCode: 0,ResMsg: "LoggedIn Successful!",AccTkn: accesstoken});
      return;
    }
    catch(err)
    {
      logger.info("Error in Login route-" + err.message);
      res.status(500).json({ ErrCode: 9999, ResMsg: "Exception Occured" });
      return;
    }
      
        
  });

  router.post("/Logout", async function (req, res, next) {
    try
    {
          var token=ExtractToken(req);
          logger.info("Request is received for Logout");
          var TokenRes=CheckTokenValidation(token);
          if(TokenRes.ResMsg==='valid' || TokenRes.ResMsg==='jwt expired')
          {
            if(TokenRes.ResMsg==='valid')
            {
              try
              {
                let User=await PL_IRIS_USERS_COLLECTION.findOneAndUpdate({ USERNAME:TokenRes.Payload.username},{$set: {IS_LODDEDIN:false,TOKEN_EXPIRY_TIME:null}});
                    let ObjPL_IRIS_BLACKLIST_TOKEN_COLLECTION=new PL_IRIS_BLACKLIST_TOKEN_COLLECTION({
                    BLACKLIST_TOKEN_ID:TokenRes.Payload.token_id,
                    TOKEN_EXPIRY_TIME:User.TOKEN_EXPIRY_TIME
                });
                await ObjPL_IRIS_BLACKLIST_TOKEN_COLLECTION.save();
                
              }
              catch(err)
              {
                logger.info("DB Connection Error in Logout request: "+err.message);
                res.json({ ErrCode: 7, ResMsg: "DB Connection Error"});
                return;
              }
            }
            res.json({ ErrCode: 0, ResMsg: "LoggedOut Successfully."});
            return;
          }
        else
        {
          res.json({ ErrCode: 1, ResMsg: "Invalid jwt token."});
          return;
        }
    }
    catch(err)
    {
      logger.info("Error in Logout route-" + err.message);
      res.status(500).json({ ErrCode: 9999, ResMsg: "Exception Occured" });
      return; 
    }
});


module.exports = router;





