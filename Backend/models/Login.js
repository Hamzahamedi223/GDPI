const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const LoginSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  username: String,
  email: { type: String, unique: true },
  password: String,
}, { collection: "login" }); 
LoginSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
const Login = mongoose.model("Login", LoginSchema);
module.exports = Login;
