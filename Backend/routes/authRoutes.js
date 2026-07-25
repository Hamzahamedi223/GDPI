const express = require("express");
const { login } = require("../Controllers/loginController");
const { register, verifyEmail } = require("../Controllers/signupController");
const { requestPasswordReset, resetPassword } = require("../Controllers/passwordResetController");

const router = express.Router();

// Authentication routes
router.post("/login", login);
router.post("/signup", register);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

module.exports = router; 