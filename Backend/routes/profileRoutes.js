const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const Signup = require('../models/Signup');
const { protect } = require('../middleware/auth');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profile-pictures/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Get profile information
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await Signup.findById(req.user._id)
      .select('username profilePicture email role department')
      .populate('role', 'name')
      .populate('department', 'name')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile information (username and profile picture)
router.put('/profile', protect, async (req, res) => {
  try {
    const { username } = req.body;
    const updateData = {};

    if (username) {
      // Check if username is already taken
      const existingUser = await Signup.findOne({ username, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      updateData.username = username;
    }

    const updatedUser = await Signup.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('username profilePicture email role department')
    .populate('role', 'name')
    .populate('department', 'name');

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile with picture
router.put('/profile/picture', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const updateData = {
      profilePicture: `/uploads/profile-pictures/${req.file.filename}`
    };

    const updatedUser = await Signup.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('username profilePicture email role department')
    .populate('role', 'name')
    .populate('department', 'name');

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update password
router.put('/profile/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both current and new password' });
    }

    const user = await Signup.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 