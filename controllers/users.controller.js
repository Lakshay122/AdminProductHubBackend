//login  track logiin time also
//logout track logout time
//fetch the users with pagination with all details
//At the time of cretae user if its type is admin then login user should also be admin

const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utilis/errorhandler");

exports.createUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password, phone_no, address } = req.body;

  try {
    // Check if user with provided email already exists
    if (!name || !email || !password || !phone_no || !address) {
      return res
        .status(400)
        .json({ success: false, message: "All field are required" });
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return next(new ErrorHandler("User Already Exits with this email", 400));
    }

    //check the type
    //Please Uncomment at the time of create the Super Admin
    const { type } = req.body;
    if (type == "admin") {
      return next(new ErrorHandler("Not able to create a Super Admin", 400));
    }

    let trimmedPassword = password.trim();
    if (trimmedPassword.length < 6) {
      return next(
        new ErrorHandler(
          "Password should be greater than or equal to 6 Characters",
          400
        )
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    // Create the user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone_no,
      address,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    return next(new ErrorHandler(`Error creating user: ${error.message}`, 400));
  }
});

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (email && password) {
    const user = await User.findOne({ email: email }).select("+password");

    if (user) {
      console.log(user);

      const isMatch = await bcrypt.compare(password, user.password);
      if (user.email == email && isMatch) {
        // Update loginTime
        user.loginTime = new Date();
        await user.save();

        // Generate JWT Token
        const token = jwt.sign(
          { userID: user._id },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "5d" }
        );

        //res.send({"status": "success","message":"LOGIN sucessful","token": token})
        res.status(200).json({
          success: true,
          message: "Login Successful",
          token: token,
          data: user,
        });
      } else {
        return next(new ErrorHandler("Email or password is not valid", 400));
      }
    } else {
      return next(new ErrorHandler("Email or password is not valid", 400));
    }
  } else {
    return next(new ErrorHandler("All fields are required", 400));
  }
});

exports.logout = catchAsyncError(async (req, res, next) => {
  const user = req.user;

  // Update logoutTime
  user.logoutTime = new Date();
  await user.save();

  res.status(200).json({
    success: true,
    message: "Logout Successful",
  });
});

exports.fetchUsers = catchAsyncError(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit of 10

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);

  const totalUsers = await User.countDocuments({ type: "user" });
  const totalPages = Math.ceil(totalUsers / pageSize);

  const users = await User.find({ type: "user" })
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .select("-password"); // Exclude the password field

  res.status(200).json({
    success: true,
    totalPages,
    currentPage: pageNumber,
    totalUsers,
    users,
  });
});

exports.fetchSingleUser = catchAsyncError(async (req, res, next) => {
  const userId = req.params.id;

  try {
    // Fetch user details by user ID
    const user = await User.findById(userId);

    // If user not found, return an error
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // If user found, return user details
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    return next(new ErrorHandler(`Error fetching user: ${err.message}`, 500));
  }
});

exports.fetchCurrentUser = catchAsyncError(async (req, res, next) => {
  // Check if user is authenticated
  if (!req.user) {
    return next(new ErrorHandler("User not authenticated", 401));
  }

  // If user is authenticated, return user details
  res.status(200).json({
    success: true,
    user: req.user,
  });
});
