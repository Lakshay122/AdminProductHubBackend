const ErrorHandler = require("../utilis/errorhandler");

module.exports = (err, req, res, next) => {

  console.log("err is this",err)
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Interval Server Error";

  //Wrong Jwt tokem
  if (err.name === "JsonWebTokenError") {
    const message = "Json web token is inValid ,try again";
    err = new ErrorHandler(message, 400);
  }

  //Jwt Expire error
  if (err.name === "TokenExpiredError") {
    const message = "Json web token is expired ,try again";
    err = new ErrorHandler(message, 400);
  }
  //Mongodb id error
  if (err.name == "CastError") {
    const message = `Resouces is not found .Invalid ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
