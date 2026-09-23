const User = require('../models/User');
const Progress = require('../models/Progress');
const { generateToken } = require('../middleware/auth');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, college, year, branch, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      college: college || '',
      year: year || '',
      branch: branch || '',
      role: role === 'admin' ? 'admin' : 'student'
    });

    // Create progress record for the user
    await Progress.create({ user: user._id });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        year: user.year,
        branch: user.branch,
        xp: user.xp,
        streak: user.streak
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        year: user.year,
        branch: user.branch,
        xp: user.xp,
        streak: user.streak,
        avatar: user.avatar,
        totalTestsAttempted: user.totalTestsAttempted,
        totalQuestionsSolved: user.totalQuestionsSolved
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        year: user.year,
        branch: user.branch,
        xp: user.xp,
        streak: user.streak,
        avatar: user.avatar,
        totalTestsAttempted: user.totalTestsAttempted,
        totalQuestionsSolved: user.totalQuestionsSolved,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, college, year, branch } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, college, year, branch },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
