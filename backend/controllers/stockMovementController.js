const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

const stockIn = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity || !reason) {
      return res.status(400).json({
        success: false,
        message: "Product, quantity and reason are required",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.stockQuantity += Number(quantity);

    await product.save();

    const movement = await StockMovement.create({
      product: product._id,
      type: "in",
      quantity: Number(quantity),
      reason,
      performedBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Stock added successfully",
      product,
      movement,
    });
  } catch (error) {
    console.error("Stock in error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while adding stock",
    });
  }
};

// STOCK OUT

const stockOut = async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity || !reason) {
      return res.status(400).json({
        success: false,
        message: "Product, quantity and reason are required",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    product.stockQuantity -= Number(quantity);

    await product.save();

    const movement = await StockMovement.create({
      product: product._id,
      type: "out",
      quantity: Number(quantity),
      reason,
      performedBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Stock removed successfully",
      product,
      movement,
    });
  } catch (error) {
    console.error("Stock out error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while removing stock",
    });
  }
};

// GET STOCK MOVEMENTS

const getStockMovements = async (req, res) => {
  try {
    const movements = await StockMovement.find()
      .populate("product", "name category unit")
      .populate("performedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: movements.length,
      movements,
    });
  } catch (error) {
    console.error("Get stock movements error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching stock movements",
    });
  }
};

module.exports = {
  stockIn,
  stockOut,
  getStockMovements,
};