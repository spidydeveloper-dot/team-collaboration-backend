const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { successResponse } = require("../utils/responseHandler");
const { UnauthorizedError, ValidationError } = require("../utils/errorTypes");
const { HTTP_STATUS } = require("../config/constants");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { email, name, password, role, teamId } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ValidationError("User already exists with this email");
    }

    // Create user
    const user = await User.create({
      email,
      name,
      password,
      role,
      teamId,
    });

    const token = generateToken(user._id);

    successResponse(res, HTTP_STATUS.CREATED, "User registered successfully", {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId: user.teamId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const token = generateToken(user._id);

    successResponse(res, HTTP_STATUS.OK, "Login successful", {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId: user.teamId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    successResponse(res, HTTP_STATUS.OK, "User retrieved successfully", {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        teamId: user.teamId,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
