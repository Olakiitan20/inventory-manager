const express = require("express");

const {
  stockIn,
  stockOut,
  getStockMovements,
} = require("../controllers/stockMovementController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// VIEW STOCK MOVEMENTS
router.get("/", protect, getStockMovements);

// ADMIN ONLY
router.post("/in", protect, adminOnly, stockIn);
router.post("/out", protect, adminOnly, stockOut);

module.exports = router;