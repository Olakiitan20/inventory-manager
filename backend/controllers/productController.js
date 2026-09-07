const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      unit,
      costPrice,
      sellingPrice,
      stockQuantity,
      lowStockThreshold,
    } = req.body;

    if (!name || !category || costPrice === undefined || sellingPrice === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Name, category, cost price and selling price are required",
      });
    }

    if (sellingPrice < costPrice) {
      return res.status(400).json({
        success: false,
        message: "Selling price cannot be lower than cost price",
      });
    }

    const existingProduct = await Product.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "A product with this name already exists",
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      unit,
      costPrice,
      sellingPrice,
      stockQuantity,
      lowStockThreshold,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while creating product",
    });
  }
};

// GET PRODUCTS

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

// GET PRODUCT BY ID

const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching product",
    });
  }
};

// UPDATE PRODUCT

const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      unit,
      costPrice,
      sellingPrice,
      stockQuantity,
      lowStockThreshold,
    } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (
      costPrice !== undefined &&
      sellingPrice !== undefined &&
      sellingPrice < costPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "Selling price cannot be lower than cost price",
      });
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (unit !== undefined) product.unit = unit;
    if (costPrice !== undefined) product.costPrice = costPrice;
    if (sellingPrice !== undefined) product.sellingPrice = sellingPrice;
    if (stockQuantity !== undefined) product.stockQuantity = stockQuantity;
    if (lowStockThreshold !== undefined) {
      product.lowStockThreshold = lowStockThreshold;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while updating product",
    });
  }
};

// DELETE PRODUCT

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isActive = false;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while deleting product",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};