const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE PRODUCT
router.post("/", protect, adminOnly, createProduct);

// VIEW PRODUCTS
router.get("/", protect, getProducts);

router.get("/:id", protect, getProductById);

// UPDATE PRODUCT
router.put("/:id", protect, adminOnly, updateProduct);

// DELETE PRODUCT
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;