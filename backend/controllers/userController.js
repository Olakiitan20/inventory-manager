const User = require("../models/User");

// ==========================================
// GET ALL USERS - ADMIN ONLY
// ==========================================
const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while fetching users",
    });
  }
};

// ==========================================
// CHANGE USER ROLE - ADMIN ONLY
// ==========================================
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["admin", "staff"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either admin or staff",
      });
    }

    // Prevent admin from changing their own role
    if (req.user.userId.toString() === id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: `User role changed to ${role} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while updating user role",
    });
  }
};

// ==========================================
// DELETE USER - ADMIN ONLY
// ==========================================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user.userId.toString() === id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin can delete either staff or another admin
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `${user.name} has been removed successfully`,
    });
  } catch (error) {
    console.error("Delete user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  deleteUser,
};