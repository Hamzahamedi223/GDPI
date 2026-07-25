const Signup = require("../models/Signup");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

console.log("Email configuration status:", {
  EMAIL_USER: process.env.EMAIL_USER ? "Set" : "Not set",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? "Set" : "Not set",
  FRONTEND_URL: process.env.FRONTEND_URL ? "Set" : "Not set"
});

exports.register = async (req, res) => {
  try {
    const { firstname, lastname, username, email, password } = req.body;
    console.log("Registration attempt for:", email);

    if (!firstname || !lastname || !username || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "All fields are required",
        field: !firstname ? "firstname" : !lastname ? "lastname" : !username ? "username" : !email ? "email" : "password"
      });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid email format",
        field: "email"
      });
    }

    if (username.length < 3) {
      return res.status(400).json({ 
        success: false,
        message: "Username must be at least 3 characters long",
        field: "username"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters long",
        field: "password"
      });
    }

    const existingUser = await Signup.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists with this email or username",
        field: existingUser.email === email.toLowerCase() ? "email" : "username"
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24); // Token expires in 24 hours

    console.log("Generated token:", verificationToken);
    console.log("Token expires at:", verificationTokenExpires);

    const user = new Signup({
      firstname,
      lastname,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpires: verificationTokenExpires
    });

    await user.save();
    console.log("User saved with token:", user.emailVerificationToken);

    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn("Email credentials not configured. Skipping verification email.");
      } else {
        const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email/${verificationToken}`;
        console.log("Sending verification email with URL:", verificationUrl);
        
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Verify Your Email",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4F46E5;">Welcome to MediTech!</h2>
              <p>Thank you for registering. Please verify your email by clicking the button below:</p>
              <a href="${verificationUrl}" 
                 style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                Verify Email
              </a>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
          `
        });
        console.log("Verification email sent successfully");
      }
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    res.status(201).json({ 
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: "Validation failed",
        errors
      });
    }
    res.status(500).json({ 
      success: false,
      message: "Registration failed",
      error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log("Verification attempt with token:", token);

    const user = await Signup.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired verification token",
        error: "Verification failed"
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;

    await user.save({ validateBeforeSave: false });

    console.log("Email verification successful for user:", user.email);
    res.status(200).json({ 
      success: true,
      message: "Email verified successfully",
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          isEmailVerified: true
        }
      }
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ 
      success: false,
      message: "Email verification failed",
      error: error.message 
    });
  }
};
