const { createLogger, format, transports } = require("winston");
var path = require("path");
var moment = require("moment");
var config = require("./Constants/config");
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss,SSS" }),
    format.printf((msg) => {
      return msg.timestamp + " - " + " " + msg.message;
    })
  ),
  transports: [
    new transports.File({
      filename: path.join(
        config.LogDir,
        "/Log" + moment(new Date()).local().format("YYYY_MM_DD") + ".txt"
      ),
      json: false,
    }),
    new transports.Console(),
  ],
});

module.exports = logger;
