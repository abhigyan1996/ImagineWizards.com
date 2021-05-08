var config= {MongoUrl:"mongodb+srv://QuarkXDatabase:abhigyanQuarkX@cluster0.s9vjq.mongodb.net", MongoDB: "QuarkXDatabase"}
var mongoose = require("mongoose");

class MongoDbConn {
  constructor(strMongoDB) {
    this.MongoUrl = config.MongoUrl;
    this.MongoDB = strMongoDB;
    this.connect = undefined;
  }
}
MongoDbConn.prototype.ConnectDb = async function () {
  const ConnectionString = this.MongoUrl + "/" + this.MongoDB;
  try {
    this.connect = await mongoose.connect(ConnectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log("Connected to MongoDB successfully");
  } catch (err) {
    console.log(err.message);
    console.log("Exiting process as MongoDB connection Fails");
    setTimeout(() => {
      process.exit(0);
    }, 100);
  }
};

MongoDbConn.prototype.DisconnectDb = function () {
  mongoose.connection.close(function () {
    console.log("Mongoose connection disconnected on process exit");
    process.exit(0);
  });
};

class Singleton {
  constructor(strMongoDB) {
    if (!Singleton.instance) {
      Singleton.instance = new MongoDbConn(strMongoDB);
    }
  }
  getInstance() {
    return Singleton.instance;
  }
}
module.exports = Singleton;
