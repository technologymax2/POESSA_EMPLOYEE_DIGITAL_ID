const mongoose = require("mongoose");

// ============================================================
// 1. USER SCHEMA
// ============================================================
// Used for:
// - Normal users
// - Admin users
// - HR users
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



const employeeSchema = new mongoose.Schema(
  {
=

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



    branch: {
      type: String,
      default: "",
      trim: true,
    },



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

    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },



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


module.exports = {
  User,
  Employee,
};
