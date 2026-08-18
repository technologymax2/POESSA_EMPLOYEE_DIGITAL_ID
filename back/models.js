const mongoose = require("mongoose");

// 2. User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "normal" },
  isBlocked: { type: Boolean, default: false },
});
const User = mongoose.model("User", userSchema);

// 4. Employee Schema
const employeeSchema = new mongoose.Schema({
  nameAmh: { type: String, default: "" },
  nameEng: { type: String, default: "" },
  age: { type: String, default: "" },
  faydaNumber: { type: String, required: true, unique: true },
  dateOfIssue: { type: String, default: "" },
  expireDate: { type: String, default: "" },
  addressAmh: { type: String, default: "" },
  addressEng: { type: String, default: "" },
  zone: { type: String, default: "" },
  city: { type: String, default: "" },
  nationality: { type: String, default: "" },
  phoneNumber: { type: String, default: "" },
  woreda: { type: String, default: "" },
  positionAmh: { type: String, default: "" },
  positionEng: { type: String, default: "" },
  branch: { type: String, default: "" }, // 👈 የቅርንጫፍ መስሪያ ቤት (Branch) እዚህ ተጨምሯል
  orgPhoneNumber: { type: String, default: "" },
  orgEmail: { type: String, default: "" },
  logoUrl: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  status: { type: String, default: "approved" },
  approved: { type: Boolean, default: true },
  date: { type: Date, default: Date.now },
});
const Employee = mongoose.model("Employee", employeeSchema);

module.exports = {
  User,
  Employee,
};
