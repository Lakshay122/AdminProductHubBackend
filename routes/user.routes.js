const express = require("express");
const {
  login,
  createUser,
  logout,
  fetchUsers,
  fetchCurrentUser,
  fetchSingleUser,
} = require("../controllers/users.controller");
const { isAuthenticated } = require("../middleware/Auth");
const { authorizedRoles } = require("../middleware/accessValidator");
const router = express.Router();

router.route("/login").post(login);
router.route("/logout").put(isAuthenticated, logout);

router
  .route("/create-user")
  .post(isAuthenticated, authorizedRoles("admin"), createUser);
router
  .route("/fetch-users")
  .get(isAuthenticated, authorizedRoles("admin"), fetchUsers);
router
  .route("/fetch-user/:id")
  .get(isAuthenticated, authorizedRoles("admin"), fetchSingleUser);

router.route("/me").get(isAuthenticated, fetchCurrentUser);

module.exports = router;
