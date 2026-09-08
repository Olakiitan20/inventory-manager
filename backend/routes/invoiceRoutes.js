const express = require("express");

const {
  createInvoice,
  getInvoices,
  getInvoiceById,
} = require("../controllers/invoiceController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createInvoice);

router.get("/", protect, getInvoices);

router.get("/:id", protect, getInvoiceById);

module.exports = router;