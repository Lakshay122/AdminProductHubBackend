const User = require("../models/User");
const catchAsyncError = require("../middleware/catchAsyncError");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utilis/errorhandler");
const { default: mongoose } = require("mongoose");

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decodedData) => {
      if (err) {
        return next(new ErrorHandler("Invalid token", 401));
      } else {
        console.log("decodedData decodedDatadecodedData ++++++=", decodedData);


        req.user = await User.findById(decodedData.userID); 
        if(!req.user ){
          return next(new ErrorHandler("You are not a Valid User",400));
        }

        // //populate the user type with role schema

        next();
      }
    });
  } else {
    return next(
      new ErrorHandler(
        "PLease login to access this resouces . Invalid token",
        401
      )
    );
  }
});
