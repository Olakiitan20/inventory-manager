const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const StockMovement = require("../models/StockMovement");

const getDashboardSummary = async (req, res) => {
  try {
    // ==============================
    // CUSTOMER COUNT
    // ==============================

    const customerCount = await Customer.countDocuments({
      isActive: true,
    });

    // ==============================
    // PRODUCT COUNT
    // ==============================

    const productCount = await Product.countDocuments({
      isActive: true,
    });

    // ==============================
    // INVOICE COUNT
    // ==============================

    const invoiceCount = await Invoice.countDocuments();

    // ==============================
    // LOW STOCK PRODUCTS
    // ==============================

    const lowStockProducts = await Product.countDocuments({
      isActive: true,
      $expr: {
        $lte: ["$stockQuantity", "$lowStockThreshold"],
      },
    });

    // ==============================
    // TOTAL SALES
    // ==============================

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

    // ==============================
    // OUTSTANDING BALANCE
    // ==============================

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

    const totalOutstanding =
      outstandingResult[0]?.totalOutstanding || 0;

    // ==============================
    // TOTAL PAYMENTS
    // ==============================

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

    const totalPayments =
      paymentsResult[0]?.totalPayments || 0;

    // ==============================
    // BEST-SELLING PRODUCTS
    // ==============================

    const bestSellingProducts = await Invoice.aggregate([
      // Break each invoice into individual items
      {
        $unwind: "$items",
      },

      // Group items by product
      {
        $group: {
          _id: "$items.product",
          totalQuantitySold: {
            $sum: "$items.quantity",
          },
          totalSalesAmount: {
            $sum: "$items.totalPrice",
          },
        },
      },

      // Highest quantity sold first
      {
        $sort: {
          totalQuantitySold: -1,
        },
      },

      // Show top 5
      {
        $limit: 5,
      },

      // Get product information
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },

      // Convert product array into object
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Return only the information dashboard needs
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: "$product.name",
          unit: "$product.unit",
          category: "$product.category",
          totalQuantitySold: 1,
          totalSalesAmount: 1,
        },
      },
    ]);

    // ==============================
    // RECENT INVOICES
    // ==============================

    const recentInvoices = await Invoice.find()
      .populate("customer", "name phone")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // ==============================
    // RECENT PAYMENTS
    // ==============================

    const recentPayments = await Payment.find()
      .populate("invoice", "invoiceNumber")
      .populate("customer", "name phone")
      .populate("receivedBy", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // ==============================
    // RECENT STOCK MOVEMENTS
    // ==============================

    const recentStockMovements = await StockMovement.find()
      .populate("product", "name category unit")
      .populate("performedBy", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // ==============================
    // SEND DASHBOARD RESPONSE
    // ==============================

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

        // New
        bestSellingProducts,

        recentInvoices,
        recentPayments,
        recentStockMovements,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard summary error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching dashboard summary",
    });
  }
};

module.exports = {
  getDashboardSummary,
};