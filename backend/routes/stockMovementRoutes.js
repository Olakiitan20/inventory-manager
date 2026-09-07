const express = require("express");

const { 
    stockIn, 
    stockOut,
    getStockMovements,
 } = require("../controllers/stockMovementController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/in", protect, stockIn);
router.post("/out", protect, stockOut);
router.get("/", protect, getStockMovements);

module.exports = router;