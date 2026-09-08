const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");

const createPayment = async (req, res) => {
  try {
    // Payment logic will go here
    const {
  invoiceId,
  amount,
  paymentMethod,
  paymentChannel,
  reference,
} = req.body;

if (!invoiceId || !amount || !paymentMethod) {
  return res.status(400).json({
    success: false,
    message: "Invoice, amount and payment method are required",
  });
}

if (amount <= 0) {
  return res.status(400).json({
    success: false,
    message: "Payment amount must be greater than zero",
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
  !["opay", "moniepoint", "bank", "other"].includes(paymentChannel)
) {
  return res.status(400).json({
    success: false,
    message: "Invalid payment channel",
  });
}
// FIND THE INVOICE
const invoice = await Invoice.findById(invoiceId);

if (!invoice) {
  return res.status(404).json({
    success: false,
    message: "Invoice not found",
  });
}
// PREVENT OVERPAYMENT
if (amount > invoice.balance) {
  return res.status(400).json({
    success: false,
    message: "Payment amount cannot be greater than the outstanding balance",
  });
}
// CALCULATE NEW INVOICE BALANCE
const newAmountPaid = invoice.amountPaid + Number(amount);
const newBalance = invoice.totalAmount - newAmountPaid;

let newStatus = "unpaid";

if (newAmountPaid === invoice.totalAmount) {
  newStatus = "paid";
} else if (newAmountPaid > 0) {
  newStatus = "partially_paid";
}
// SAVE PAYMENT RECORD
const payment = await Payment.create({
  invoice: invoice._id,
  customer: invoice.customer,
  amount: Number(amount),
  paymentMethod,
  paymentChannel: paymentMethod === "transfer" ? paymentChannel : undefined,
  reference,
  receivedBy: req.user.userId,
});
// UPDATE INVOICE
invoice.amountPaid = newAmountPaid;
invoice.balance = newBalance;
invoice.status = newStatus;

await invoice.save();

res.status(201).json({
  success: true,
  message: "Payment recorded successfully",
  payment,
  invoice: {
    invoiceNumber: invoice.invoiceNumber,
    totalAmount: invoice.totalAmount,
    amountPaid: invoice.amountPaid,
    balance: invoice.balance,
    status: invoice.status,
  },
});

  } catch (error) {
    console.error("Create payment error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while creating payment",
    });
  }
};

// GET PAYMENTS RECORDS

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("invoice", "invoiceNumber totalAmount status")
      .populate("customer", "name phone email")
      .populate("receivedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get payments error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching payments",
    });
  }
};

// GET PAYMENT BY ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("invoice", "invoiceNumber totalAmount amountPaid balance status")
      .populate("customer", "name phone email")
      .populate("receivedBy", "name email");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get payment by ID error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching payment",
    });
  }
};

module.exports = {
  createPayment,
  getPayments,
  getPaymentById,
};