const express = require("express");
const { isAuthenticated } = require("../middleware/Auth");
const { authorizedRoles } = require("../middleware/accessValidator");
const {
  createProduct,
  updateProduct,
  fetchProducts,
  deleteProduct,
} = require("../controllers/product.controlller");

const router = express.Router();

router
  .route("/create")
  .post(isAuthenticated, authorizedRoles("user"), createProduct);
router
  .route("/update/:id")
  .put(isAuthenticated, authorizedRoles("user"), updateProduct);

router
  .route("/:id")
  .delete(isAuthenticated, authorizedRoles("user"), deleteProduct);

router
  .route("/get-all")
  .get(isAuthenticated, authorizedRoles("user"), fetchProducts)
  .post(isAuthenticated, authorizedRoles("admin"), fetchProducts);

module.exports = router;
