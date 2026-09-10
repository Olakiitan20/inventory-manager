const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

const createInvoice = async (req, res) => {
  try {
    const {
      customerId,
      items,
      amountPaid = 0,
      paymentMethod,
      paymentChannel,
    } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Customer and at least one product are required",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    if (!["cash", "transfer", "card"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    if (paymentMethod === "transfer" && !paymentChannel) {
      return res.status(400).json({
        success: false,
        message: "Payment channel is required for transfer payments",
      });
    }

    if (
      paymentChannel &&
      !["opay", "moniepoint", "palmpay", "bank", "other"].includes(
        paymentChannel
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment channel",
      });
    }

    if (amountPaid < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount paid cannot be negative",
      });
    }

    const customer = await Customer.findOne({
      _id: customerId,
      isActive: true,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    let subtotal = 0;
    const invoiceItems = [];

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        isActive: true,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: "Product quantity must be greater than zero",
        });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const totalPrice = product.sellingPrice * item.quantity;

      subtotal += totalPrice;

      invoiceItems.push({
        product: product._id,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        totalPrice,
      });
    }

    const totalAmount = subtotal;

    if (amountPaid > totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Amount paid cannot be greater than total amount",
      });
    }

    const balance = totalAmount - amountPaid;

    let status = "unpaid";

    if (amountPaid === totalAmount) {
      status = "paid";
    } else if (amountPaid > 0) {
      status = "partially_paid";
    }

    const invoiceCount = await Invoice.countDocuments();

    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(
      4,
      "0"
    )}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      customer: customer._id,
      items: invoiceItems,
      subtotal,
      totalAmount,
      amountPaid,
      balance,
      status,
      paymentMethod,
      paymentChannel:
        paymentMethod === "transfer" ? paymentChannel : undefined,
      createdBy: req.user.userId,
    });

    for (const item of invoiceItems) {
      const product = await Product.findById(item.product);

      product.stockQuantity -= item.quantity;

      await product.save();

      await StockMovement.create({
        product: product._id,
        type: "out",
        quantity: item.quantity,
        reason: `Sale - ${invoiceNumber}`,
        performedBy: req.user.userId,
      });
    }

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    console.error("Create invoice error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while creating invoice",
    });
  }
};

// GET INVOICES

const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("customer", "name phone email customerType")
      .populate("items.product", "name category unit")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error("Get invoices error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching invoices",
    });
  }
};

// GET INVOICE BY ID

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customer", "name phone email customerType")
      .populate("items.product", "name category unit")
      .populate("createdBy", "name email");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("Get invoice by ID error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching invoice",
    });
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
};