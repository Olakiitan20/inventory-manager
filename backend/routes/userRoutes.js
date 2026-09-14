const express = require("express");

const {
  getUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// GET ALL USERS
// ADMIN ONLY
// ==========================================
router.get("/", protect, adminOnly, getUsers);

// ==========================================
// CHANGE USER ROLE
// ADMIN ONLY
// ==========================================
router.put(
  "/:id/role",
  protect,
  adminOnly,
  updateUserRole
);

// ==========================================
// DELETE USER
// ADMIN ONLY
// ==========================================
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteUser
);

module.exports = router;