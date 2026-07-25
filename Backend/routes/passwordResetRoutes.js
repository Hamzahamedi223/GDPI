const express = require("express");
const { requestPasswordReset, resetPassword } = require("../Controllers/passwordResetController");

const router = express.Router();

router.post("/request-reset", requestPasswordReset);
router.post("/reset", resetPassword);

module.exports = router; 