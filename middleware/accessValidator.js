//middlw

const ErrorHandler = require("../utilis/errorhandler");

exports.authorizedRoles = (...roles) => {
  // console.log("authorized also called")
  return (req, res, next) => {
    if (!roles.includes(req.user.type)) {
      return next(
        new ErrorHandler(
          `Role ${req.user.type} is not allowed to access this resource`
        )
      );
    }
    next();
  };
};
