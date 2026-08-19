const mongoose = require("mongoose");

// ============================================================
// 1. USER SCHEMA
// ============================================================
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["normal", "admin", "hr"],
      default: "normal",
      lowercase: true,
      trim: true,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);


// ============================================================
// 2. EMPLOYEE SCHEMA
// ============================================================
const employeeSchema = new mongoose.Schema(
  {
    // --------------------------------------------------------
    // PERSONAL INFORMATION
    // --------------------------------------------------------
    nameAmh: {
      type: String,
      default: "",
      trim: true,
    },

    nameEng: {
      type: String,
      default: "",
      trim: true,
    },

    age: {
      type: String,
      default: "",
      trim: true,
    },

    // --------------------------------------------------------
    // FAYDA
    // --------------------------------------------------------
    faydaNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // --------------------------------------------------------
    // ID CARD DATES
    // --------------------------------------------------------
    dateOfIssue: {
      type: String,
      default: "",
      trim: true,
    },

    expireDate: {
      type: String,
      default: "",
      trim: true,
    },

    // --------------------------------------------------------
    // ADDRESS
    // --------------------------------------------------------
    addressAmh: {
      type: String,
      default: "",
      trim: true,
    },

    addressEng: {
      type: String,
      default: "",
      trim: true,
    },

    zone: {
      type: String,
      default: "",
      trim: true,
    },

    woreda: {
      type: String,
      default: "",
      trim: true,
    },

    // --------------------------------------------------------
    // NATIONALITY
    // --------------------------------------------------------
    nationality: {
      type: String,
      default: "",
      trim: true,
    },

    // --------------------------------------------------------
    // EMPLOYEE PHONE
    // --------------------------------------------------------
    phoneNumber: {
      type: String,
      default: "",
      trim: true,
    },

    // --------------------------------------------------------
    // POSITION
    // --------------------------------------------------------
    positionAmh: {
      type: String,
      default: "",
      trim: true,
    },

    positionEng: {
      type: String,
      default: "",
      trim: true,
    },

    // --------------------------------------------------------
    // BRANCH
    // --------------------------------------------------------
    branchAmh: {
      type: String,
      default: "",
      trim: true,
    },

    branchEng: {
      type: String,
      default: "",
      trim: true,
    },

    // --------------------------------------------------------
    // ORGANIZATION INFORMATION
    // --------------------------------------------------------
    orgPhoneNumber: {
      type: String,
      default: "",
      trim: true,
    },

    orgEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    // --------------------------------------------------------
    // IMAGES
    // --------------------------------------------------------
    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // --------------------------------------------------------
    // EMPLOYEE STATUS
    // --------------------------------------------------------
    status: {
      type: String,
      enum: ["approved", "pending", "resigned", "inactive"],
      default: "approved",
      trim: true,
    },

    approved: {
      type: Boolean,
      default: true,
    },

    // --------------------------------------------------------
    // CREATED DATE
    // --------------------------------------------------------
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Employee = mongoose.model("Employee", employeeSchema);


// ============================================================
// 3. EXPORT MODELS
// ============================================================
module.exports = {
  User,
  Employee,
};
