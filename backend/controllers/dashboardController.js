const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const StockMovement = require("../models/StockMovement")

const getDashboardSummary = async (req, res) => {
  try {
    // Dashboard logic will go here
    const customerCount = await Customer.countDocuments({
  isActive: true,
});

const productCount = await Product.countDocuments({
  isActive: true,
});

const invoiceCount = await Invoice.countDocuments();

// CALCULATE LOW-STOCK PRODUCT

const lowStockProducts = await Product.countDocuments({
  isActive: true,
  $expr: {
    $lte: ["$stockQuantity", "$lowStockThreshold"],
  },
});

// CALCULATE TOTAL SALES
const salesResult = await Invoice.aggregate([
  {
    $group: {
      _id: null,
      totalSales: {
        $sum: "$totalAmount",
      },
    },
  },
]);

const totalSales = salesResult[0]?.totalSales || 0;

// CALCULATE OUTSTANDING BALANCE
const outstandingResult = await Invoice.aggregate([
  {
    $group: {
      _id: null,
      totalOutstanding: {
        $sum: "$balance",
      },
    },
  },
]);

const totalOutstanding = outstandingResult[0]?.totalOutstanding || 0;

const paymentsResult = await Payment.aggregate([
    {
        $group: {
            _id: null,
            totalPayments: {
                $sum: "$amount",
            },
        },
    },
]);

const totalPayments = paymentsResult[0]?.totalPayments || 0;

// RECENT INVOICE
const recentInvoices = await Invoice.find()
  .populate("customer", "name phone")
  .populate("createdBy", "name")
  .sort({ createdAt: -1 })
  .limit(5);

//   RECENT PAYMENT
const recentPayments = await Payment.find()
  .populate("invoice", "invoiceNumber")
  .populate("customer", "name phone")
  .populate("receivedBy", "name")
  .sort({ createdAt: -1 })
  .limit(5);

//   RECENT STOCK MOVEMENTS
const recentStockMovements = await StockMovement.find()
  .populate("product", "name category unit")
  .populate("performedBy", "name")
  .sort({ createdAt: -1 })
  .limit(5);

res.status(200).json({
  success: true,
  summary: {
    customerCount,
    productCount,
    invoiceCount,
    lowStockProducts,
    totalSales,
    totalPayments,
    totalOutstanding,
    recentInvoices,
    recentPayments,
    recentStockMovements,
  },
});

  } catch (error) {
    console.error("Dashboard summary error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard summary",
    });
  }
};

module.exports = {
  getDashboardSummary,
};