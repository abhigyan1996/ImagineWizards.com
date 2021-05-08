var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var config=require("./config/config");
var otpGenerator = require('otp-generator');
const NodeCache = require( "node-cache" );
var bcrypt=require("bcrypt");
const myCache = new NodeCache( { stdTTL: 3 * 60, checkperiod: 100} );

const passport = require("passport"); //This is used for authentication
const LocalStrategy = require("passport-local").Strategy;
var USER_PROFILE=require("./models/USER_PROFILE_COLLECTION");


passport.use(new LocalStrategy({usernameField: 'email',
passwordField: 'password'},
  function(email, password, done) {
    USER_PROFILE.findOne({ EMAIL: email }, function (err, user) {
         if (err) { 
          return done(err); 
          }
        else if (!user) { 
          return done(null, false); 
        }
        else
          {
            if(validPassword(password,user.PASSWORD))
            {
            return done(null, user);
            }
            else
            {
              return done(null, false); 
            }
          }
    });
  }
));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});                   
passport.deserializeUser(function(id, done) {
              
  USER_PROFILE.findById(id, function(err, user) {
      done(err, user);
  });          
});

var transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: config.email,
    pass: config.password
  }
}));

var SendOtp=async function (Sendtoemail,strpurpose)
{
  let otp=otpGenerator.generate(6, { upperCase: false, specialChars: false ,alphabets:false});
  myCache.set( Sendtoemail, otp)
  var mailOptions = {
  from: config.email,
  to: Sendtoemail,
  subject: 'Otp from QuarkX',
  text: `Your Otp for QuarkX ${strpurpose} is ${otp}`
   };
  try
  {
    let res=await transporter.sendMail(mailOptions);
    return true;
  }
  catch(err)
  {
    console.log(err.message);
    return false;
  }

}

var VerifyOtp=function (ObjReqKey,otpReq)
{
  let otp=myCache.get(ObjReqKey);
  if(otp==otpReq)
  {
    return true;
  }
  return false;

}

var generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
  };
  
  var validPassword = function(passwordUI,passwordDB) {
  return bcrypt.compareSync(passwordUI, passwordDB);
  };

  var IsLoggedIn = function(req,res,next) {
    if(req.user)
    {
      next();
    }
    else
    {
    res.json({ResMsg:"You are not logged In"});
    }
    };

module.exports={
  SendOtp:SendOtp,
  VerifyOtp:VerifyOtp,
  generateHash:generateHash,
  validPassword:validPassword,
  IsLoggedIn:IsLoggedIn

}