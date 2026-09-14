const express = require("express");

const {
  registerUser,
  loginUser,
  changePassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Change password
// User must be logged in
router.put("/change-password", protect, changePassword);

module.exports = router;