const express = require("express");

const {
  createPayment,
  getPayments,
  getPaymentById,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createPayment);
router.get("/", protect, getPayments);
router.get("/:id", protect, getPaymentById);

module.exports = router;