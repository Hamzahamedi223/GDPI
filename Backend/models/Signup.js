const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SignupSchema = new mongoose.Schema(
  { 
    firstname: {
      type: String,
      required: [true, "Firstname is required"],
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, "Lastname is required"],
      trim: true,
    },
    username: { 
      type: String, 
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"]
    },
    email: { 
      type: String, 
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please enter a valid email address"]
    },
    password: { 
      type: String, 
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      validate: {
        validator: function(v) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
        },
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      }
    },
    profilePicture: {
      type: String,
      default: null,
      trim: true
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: false
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: false
    },
    isEmailVerified: { 
      type: Boolean, 
      default: false
    },
    emailVerificationToken: { 
      type: String,
      required: false
    },
    emailVerificationTokenExpires: { 
      type: Date,
      required: false
    },
    resetPasswordToken: { 
      type: String,
      required: false
    },
    resetPasswordExpires: { 
      type: Date,
      required: false
    }
  },
  { 
    timestamps: true,
    validateBeforeSave: false // Disable validation on save
  }
);

// Set default role before saving
SignupSchema.pre("save", async function (next) {
  if (!this.role) {
    try {
      const defaultRole = await mongoose.model("Role").findOne({ name: "user" });
      if (defaultRole) {
        this.role = defaultRole._id;
      } else {
        console.warn("⚠️ Default role not found in database! Ensure 'user' role exists.");
      }
    } catch (error) {
      console.error("Error finding default role:", error);
    }
  }
  next();
});

// Set default department before saving
SignupSchema.pre("save", async function (next) {
  if (!this.department) {
    try {
      const defaultDept = await mongoose.model("Department").findOne({ name: "General" });
      if (defaultDept) {
        this.department = defaultDept._id;
      } else {
        console.warn("⚠️ Default department not found! Ensure 'General' department exists in the DB.");
      }
    } catch (error) {
      console.error("Error finding default department:", error);
    }
  }
  next();
});

// Hash password before saving
SignupSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
SignupSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const Signup = mongoose.model("Signup", SignupSchema);

module.exports = Signup;
