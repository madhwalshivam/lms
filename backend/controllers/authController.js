const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Sales Executive',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register Expo Push Token
// @route   POST /api/auth/push-token
// @access  Private (or Public for testing)
exports.registerPushToken = async (req, res) => {
  const { userId, token } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add token if it doesn't already exist
    if (token && !user.expoPushTokens.includes(token)) {
      user.expoPushTokens.push(token);
      await user.save();
    }

    res.json({ success: true, message: 'Push token registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sales executives
// @route   GET /api/auth/executives
// @access  Public
exports.getExecutives = async (req, res) => {
  try {
    const executives = await User.find({ role: 'Sales Executive' }).select('name email');
    res.json(executives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Initiate password reset (Generate OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email address is required' });
  }
  const emailFormatted = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email: emailFormatted });

    if (!user) {
      return res.status(404).json({ message: 'No account registered with this email address' });
    }

    // Generate a simple 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    res.json({
      success: true,
      message: 'Verification code generated.',
      otp, // Returned in JSON for easy sandboxed testing
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete password reset with OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'All fields (email, otp, newPassword) are required' });
  }
  const emailFormatted = email.toLowerCase().trim();

  try {
    const user = await User.findOne({
      email: emailFormatted,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
