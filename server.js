const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

var passport  = require('passport');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var CMongoDbConn;
  app.use('/web', express.static('public'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended:true}));

// const PORT = process.env.PORT || 8000;
// const DBURI = process.env.MONGODB_URI || "mongodb://abhigyan:abhigyan1@ds055525.mlab.com:55525/abhigyan";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/styles",express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({
    extended: true
}));

var AppStart=async function()
{

var MongoDB = require('./Database/MongoDbConn')
CMongoDbConn = new MongoDB("QuarkXDatabase").getInstance();

try{
  await CMongoDbConn.ConnectDb();
}

catch(err){
  console.log(err.message)
}
const quarksRoutes = require('./routes/quarks')
const advertisementsRoutes = require('./routes/advertisements')
const userProfileRoute=require('./routes/UserManagement')
const mainRoutes = require('./routes/index');
const QuarkXAcademyRoute=require('./routes/QuarkXAcademy');
const payment=require("./routes/payment");


// mongoose.connect(DBURI, { useNewUrlParser: true, useUnifiedTopology: true });
// const connection = mongoose.connection;

// connection.once('open', function () {
//     console.log("MongoDB database connection established successfully");
// })
app.use(cookieParser("session-secret-Pine-Labs"));
app.use(session({
  secret: "session-secret-Pine-Labs",
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge:24*60*60*1000
  }

}));
app.use(cookieParser("session-secret-Pine-Labs"));
app.use(passport.initialize());
app.use(passport.session());

app.use('/UserProfile',userProfileRoute)
app.use('/', mainRoutes);
app.use('/QuarkX', quarksRoutes);
app.use('/QuarkXAcademy',QuarkXAcademyRoute);
app.use('/api/payment',payment);


app.get('*', function (req, res) {
    return res.render('error');
});

app.listen(process.env.PORT || 8001,()=>{
  console.log("server is listening");
})

}

AppStart();

module.exports={
  MongoDbConn:CMongoDbConn
}



