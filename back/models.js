const mongoose = require("mongoose");

// 1. Lead Schema
const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  companyName: { type: String, default: "" },
  businessType: { type: String, default: "" },
  address: { type: String, default: "" },
  phone: { type: String, required: true, unique: true },
  status: { type: String, default: "ያልተደወለ" },
  comment: { type: String, default: "" },
  salesPerson: { type: String, default: "" },
  uploadedBy: { type: String, default: "" },
  updatedBy: { type: String, default: "" },
  deletedBy: { type: String, default: "" },
  date: { type: Date, default: Date.now },
});
const Lead = mongoose.model("Lead", leadSchema);

// 2. User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "normal" },
  isBlocked: { type: Boolean, default: false },
});
const User = mongoose.model("User", userSchema);

// 3. Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  reply: { type: String, default: "" },
  status: { type: String, default: "በጥበቃ ላይ" },
  date: { type: Date, default: Date.now },
});
const Contact = mongoose.model("Contact", contactSchema);

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
  orgPhoneNumber: { type: String, default: "" },
  orgEmail: { type: String, default: "" },
  logoUrl: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  status: { type: String, default: "approved" },
  approved: { type: Boolean, default: true },
  date: { type: Date, default: Date.now },
});
const Employee = mongoose.model("Employee", employeeSchema);

// 5. Project Schema
const projectSchema = new mongoose.Schema({
  title: String,
  link: String,
  imageUrl: String,
  date: { type: Date, default: Date.now },
});
const Project = mongoose.model("Project", projectSchema);

module.exports = {
  Lead,
  User,
  Contact,
  Employee,
  Project,
};
