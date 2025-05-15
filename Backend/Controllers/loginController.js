const Signup = require("../models/Signup");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    const user = await Signup.findOne({ email: email.toLowerCase() })
      .populate({
        path: 'role',
        select: 'name'
      })
      .populate({
        path: 'department',
        select: 'name'
      });
    
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        success: false,
        message: "Please verify your email before logging in",
        needsVerification: true
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const roleName = user.role?.name || "user";
    const departmentName = user.department?.name;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { 
        id: user._id, 
        email: user.email, 
        username: user.username,
        isEmailVerified: user.isEmailVerified,
        role: {
          _id: user.role?._id,
          name: roleName
        },
        department: user.department ? {
          _id: user.department._id,
          name: departmentName
        } : null
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      message: "Login failed",
      error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
};
