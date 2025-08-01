import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // For admin-only access, create admin user object
    if (decoded.userId === "admin-user-id") {
      req.user = {
        _id: "admin-user-id",
        email: "admin@gmail.com",
        name: "Admin User",
        isActive: true,
      };
      next();
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid token or user not found.",
      });
    }
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    });
  }
};
