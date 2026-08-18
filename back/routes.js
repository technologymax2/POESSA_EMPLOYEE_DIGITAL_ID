const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const { User,  Employee } = require("./models");

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

router.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) return res.status(400).json({ success: false, error: "ይህ ኢሜይል/ዩዘርኔም ቀድሞ ተመዝግቧል!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: "normal",
    });

    await newUser.save();
    res.status(201).json({ success: true, message: "ምዝገባው በስኬት ተጠናቋል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "የምዝገባ ስህተት ተፈጥሯል" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: cleanEmail });
    let role = user ? user.role : null;

    if (!user) {
      const employee = await Employee.findOne({ email: cleanEmail });
      if (employee) {
        user = employee;
        role = employee.role || "hr";
      }
    }

    if (!user) return res.status(400).json({ success: false, error: "ኢሜይል/ዩዘርኔም ወይም ፓስወርድ ተሳስቷል!" });

    if (user.isBlocked) {
      return res.status(403).json({ success: false, error: "አካውንትዎ በአድሚን ታግዷል! እባክዎ ባለሙያ ያነጋግሩ።" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, error: "ኢሜይል/ዩዘርኔም ወይም ፓስወርድ ተሳስቷል!" });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name || user.nameAmh,
        email: user.email,
        role: role ? role.toLowerCase().trim() : "normal",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "የመግባት ስህተት ተፈጥሯል" });
  }
});

// ==========================================
// ADMIN & MANAGEMENT ROUTES
// ==========================================


router.post("/admin/add-admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) return res.status(400).json({ success: false, error: "ይህ ኢሜይል/ዩዘርኔም ቀድሞ ተመዝግቧል!" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();
    res.status(201).json({ success: true, message: "አዲሱ አድሚን በስኬት ተመዝግቧል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "አድሚን መፍጠር አልተቻለም" });
  }
});

router.get("/admin/list", async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, error: "የአድሚኖችን ዝርዝር ማምጣት አልተቻለም" });
  }
});

router.put("/admin/update/:id", async (req, res) => {
  try {
    const { name, email } = req.body;
    await User.findByIdAndUpdate(req.params.id, {
      name,
      email: email ? email.toLowerCase().trim() : undefined,
    });
    res.status(200).json({ success: true, message: "የአድሚን መረጃ ተስተካክሏል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ማስተካከሉ አልተሳካም" });
  }
});

router.put("/admin/reset-password/:id", async (req, res) => {
  try {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.status(200).json({ success: true, message: "የአድሚኑ ፓስወርድ በስኬት ተለውጧል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ፓስወርድ መቀየር አልተቻለም" });
  }
});

router.delete("/admin/delete/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "አድሚኑ በተሳካ ሁኔታ ተሰርዟል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "አድሚኑን ማጥፋት አልተቻለም" });
  }
});

// ==========================================
// HR & EMPLOYEE ROUTES
// ==========================================

router.post("/hr/employees", async (req, res) => {
  try {
    const { faydaNumber } = req.body;
    if (faydaNumber) {
      const existingEmployee = await Employee.findOne({ faydaNumber });
      if (existingEmployee) {
        return res.status(400).json({ success: false, error: "ይህ የፋይዳ ቁጥር ቀድሞ ተመዝግቧል!" });
      }
    }

    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res.status(201).json({ success: true, message: "ሰራተኛው በስኬት ተመዝግቧል!", employee: newEmployee });
  } catch (error) {
    console.error("Employee registration error:", error);
    res.status(500).json({ success: false, error: "ሰርቨር ላይ ስህተት ተፈጥሯል!" });
  }
});

router.get("/hr/employees", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ date: -1 });
    res.status(200).json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, error: "ሰራተኞቹን ማምጣት አልተቻለም" });
  }
});

router.delete("/hr/employees/:id", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "ሰራተኛው ተሰርዟል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ሰራተኛውን ማጥፋት አልተቻለም" });
  }
});

router.put("/hr/employees/:id", async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ success: false, error: "ሰራተኛው አልተገኘም!" });
    }

    res.status(200).json({ 
      success: true, 
      message: "የሰራተኛው መረጃ በተሳካ ሁኔታ ተዘምኗል!", 
      employee: updatedEmployee 
    });
  } catch (error) {
    console.error("Employee update error:", error);
    res.status(500).json({ success: false, error: "ሰራተኛውን ማዘመን አልተቻለም" });
  }
});

router.post("/admin/hrs", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "ይህ ኢሜይል ቀድሞ ተመዝግቧል!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newHr = new User({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: "hr",
    });

    await newHr.save();
    res.status(201).json({ success: true, message: "HR በስኬት ተመዝግቧል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ሰርቨር ላይ ስህተት ተፈጥሯል" });
  }
});

router.get("/admin/hrs", async (req, res) => {
  try {
    const hrs = await User.find({ role: "hr" }).select("-password");
    res.status(200).json({ success: true, hrs });
  } catch (error) {
    res.status(500).json({ success: false, error: "የ HR ዝርዝር ማምጣት አልተቻለም" });
  }
});

router.delete("/admin/hrs/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "HR ተሰርዟል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ማጥፋት አልተቻለም" });
  }
});

router.put("/admin/hrs/reset-password/:id", async (req, res) => {
  try {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.status(200).json({ success: true, message: "የ HR ፓስወርድ ተቀይሯል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ፓስወርድ መቀየር አልተቻለም" });
  }
});

router.get("/hr/verify/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: "ሰራተኛው አልተገኘም!" });
    }
    res.status(200).json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, error: "ሰርቨር ላይ ስህተት ተፈጥሯል" });
  }
});

router.get("/hr/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, error: "የፍለጋ ቃል አልገባም!" });
    }
    
    const employees = await Employee.find({
      $or: [
        { nameAmh: { $regex: query, $options: "i" } },
        { nameEng: { $regex: query, $options: "i" } },
        { faydaNumber: { $regex: query, $options: "i" } }
      ]
    });

    res.status(200).json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, error: "ፍለጋውን ማከናወን አልተቻለም" });
  }
});


module.exports = router;
