const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone_no: {
      type: String,
      required: true,
      match: [/^\d{10}$/, "Please fill a valid phone number (10 digits)"],
    },
    address: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    loginTime: {
      type: Date,
    },
    logoutTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
