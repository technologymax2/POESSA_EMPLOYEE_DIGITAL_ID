const mongoose = require("mongoose");

// ============================================================
// USER SCHEMA
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
// EMPLOYEE SCHEMA
// ============================================================

const employeeSchema = new mongoose.Schema(
  {
    // ----------------------------------------------------------
    // PERSONAL INFORMATION
    // ----------------------------------------------------------

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

    faydaNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },


    // ----------------------------------------------------------
    // ID CARD DATES
    // ----------------------------------------------------------

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


    // ----------------------------------------------------------
    // ADDRESS
    // ----------------------------------------------------------

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

    city: {
      type: String,
      default: "",
      trim: true,
    },

    woreda: {
      type: String,
      default: "",
      trim: true,
    },


    // ----------------------------------------------------------
    // NATIONALITY / PHONE
    // ----------------------------------------------------------

    nationality: {
      type: String,
      default: "",
      trim: true,
    },

    phoneNumber: {
      type: String,
      default: "",
      trim: true,
    },


    // ----------------------------------------------------------
    // POSITION
    // ----------------------------------------------------------

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


    // ----------------------------------------------------------
    // BRANCH
    // IMPORTANT: THESE WERE MISSING BEFORE
    // ----------------------------------------------------------

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


    // ----------------------------------------------------------
    // ORGANIZATION INFORMATION
    // ----------------------------------------------------------

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

    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },


    // ----------------------------------------------------------
    // EMPLOYEE PHOTO
    // ----------------------------------------------------------

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },


    // ----------------------------------------------------------
    // EMPLOYEE STATUS
    // ----------------------------------------------------------

    status: {
      type: String,
      enum: [
        "approved",
        "pending",
        "resigned",
        "inactive",
      ],
      default: "approved",
      trim: true,
    },

    approved: {
      type: Boolean,
      default: true,
    },


    // ----------------------------------------------------------
    // RESIGNATION
    // ----------------------------------------------------------

    resignedDate: {
      type: String,
      default: "",
      trim: true,
    },

    resignationReason: {
      type: String,
      default: "",
      trim: true,
    },


    // ----------------------------------------------------------
    // CREATED DATE
    // ----------------------------------------------------------

    date: {
      type: Date,
      default: Date.now,
    },
  },

  {
    timestamps: true,
  }
);

const Employee = mongoose.model(
  "Employee",
  employeeSchema
);


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  User,
  Employee,
};
