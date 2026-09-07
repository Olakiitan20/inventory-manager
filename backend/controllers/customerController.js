const Customer = require("../models/Customer");

// CREATE CUSTOMER

const createCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      customerType,
      creditLimit,
    } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({
        success: false,
        message: "Customer name and phone are required",
      });
    }

    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "A customer with this email already exists",
      });
    }

    const customer = await Customer.create({
      name,
      phone,
      email,
      address,
      customerType,
      creditLimit,
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Create customer error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while creating customer",
    });
  }
};

// GET CUSTOMER

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ isActive: true}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Get customers error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching customers",
    });
  }
};

// GET CUSTOMERS BY ID

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Get customer error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching customer",
    });
  }
};

// UPDATE CUSTOMER

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const {
      name,
      phone,
      email,
      address,
      customerType,
      creditLimit,
      isActive,
    } = req.body;

    if (name !== undefined) customer.name = name;
    if (phone !== undefined) customer.phone = phone;
    if (email !== undefined) customer.email = email;
    if (address !== undefined) customer.address = address;
    if (customerType !== undefined) customer.customerType = customerType;
    if (creditLimit !== undefined) customer.creditLimit = creditLimit;
    if (isActive !== undefined) customer.isActive = isActive;

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Update customer error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while updating customer",
    });
  }
};

// DELETE CUSTOMER

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    customer.isActive = false;

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer deactivated successfully",
      customer,
    });
  } catch (error) {
    console.error("Delete customer error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while deactivating customer",
    });
  }
};

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};