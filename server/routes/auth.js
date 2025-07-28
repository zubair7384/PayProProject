import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";
import {
  validateSignin,
  handleValidationErrors,
} from "../middleware/validation.js";

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @route   POST /api/auth/signin
// @desc    Sign in user
// @access  Public
router.post(
  "/signin",
  validateSignin,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Only allow admin user to login
      const ADMIN_EMAIL = "artilectsolutions2024@gmail.com";
      const ADMIN_PASSWORD = "Passpass@123";

      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Create admin user object (no need to check database)
      const adminUser = {
        _id: "admin-user-id",
        email: ADMIN_EMAIL,
        name: "Admin User",
      };

      // Generate token
      const token = generateToken(adminUser._id);

      res.json({
        success: true,
        message: "Sign in successful",
        data: {
          token,
          user: {
            id: adminUser._id,
            email: adminUser.email,
            name: adminUser.name,
          },
        },
      });
    } catch (error) {
      console.error("Sign in error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during sign in",
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token
// @access  Private
router.post("/verify-token", authenticate, (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    data: {
      user: req.user,
    },
  });
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token cleanup)
// @access  Public
router.post("/logout", (req, res) => {
  try {
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
});

export default router;
