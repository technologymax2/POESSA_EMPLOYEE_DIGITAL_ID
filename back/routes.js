const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const XLSX = require("xlsx");
const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

const { Lead, User, Contact, Employee, Project } = require("./models");

// ==========================================
// SALES / LEADS ROUTES
// ==========================================

router.post("/sales/upload-excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "እባክዎ የ Excel ፋይል ይምረጡ!" });
    }

    const uploadedBy = req.body.uploadedBy || "ያልታወቀ ሰራተኛ";
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (!rows || rows.length === 0) {
      return res.status(400).json({ success: false, error: "የኤክሴል ፋይሉ ባዶ ነው!" });
    }

    let count = 0;
    let skippedCount = 0;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const name = row[0] || "ስም የሌለው";
      const companyName = row[1] || "";
      const businessType = row[2] || "";
      const address = row[3] || "";
      
      let phone = "";
      let websiteInfo = "";

      for (let j = 4; j < row.length; j++) {
        const val = String(row[j] || "").trim();
        if (val.match(/^[0-9+\-\s()]{7,}$/)) {
          phone = val;
        } else if (val.toLowerCase().includes("web") || val.toLowerCase().includes("site")) {
          websiteInfo = val;
        }
      }

      if (phone) {
        const cleanPhone = String(phone).trim();
        const existingLead = await Lead.findOne({ phone: cleanPhone });
        if (existingLead) {
          skippedCount++;
          continue;
        }

        await Lead.create({
          name: String(name).trim(),
          companyName: String(companyName).trim(),
          businessType: String(businessType).trim(),
          address: String(address).trim(),
          phone: cleanPhone,
          status: "ያልተደወለ",
          comment: websiteInfo ? `ሁኔታ: ${websiteInfo}` : "",
          uploadedBy: uploadedBy,
        });
        count++;
      }
    }

    if (count === 0 && skippedCount === 0) {
      return res.status(400).json({ success: false, error: "በፋይሉ ውስጥ የሚነበብ ስልክ ቁጥር ያለው መረጃ አልተገኘም!" });
    }

    res.status(200).json({ 
      success: true, 
      message: `ፋይሉ ተጭኗል! ${count} አዳዲስ ደንበኞች ተመዝገበዋል፣ ${skippedCount} የተባዙ (Duplicate) ስልክ ቁጥሮች ተዘለዋል።` 
    });
  } catch (error) {
    console.error("Excel upload error:", error);
    res.status(500).json({ success: false, error: "ፋይሉን ማንበብ ወይም መመዝገብ አልተቻለም" });
  }
});

router.get("/sales/leads", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ date: -1 });
    res.status(200).json({ success: true, leads });
  } catch (error) {
    res.status(500).json({ success: false, error: "መረጃዎችን ማምጣት አልተቻለም" });
  }
});

router.post("/sales/leads", async (req, res) => {
  try {
    const { name, companyName, businessType, address, phone, comment, uploadedBy } = req.body;

    if (!phone || !name) {
      return res.status(400).json({ success: false, error: "እባክዎ ስም እና ስልክ ቁጥር በትክክል ያስገቡ!" });
    }

    const cleanPhone = String(phone).trim();
    const existingLead = await Lead.findOne({ phone: cleanPhone });
    if (existingLead) {
      return res.status(400).json({ success: false, error: "ይህ ስልክ ቁጥር ቀድሞ ተመዝግቧል! ድጋሚ መመዝገብ አይቻልም።" });
    }

    const newLead = new Lead({
      name: String(name).trim(),
      companyName: companyName ? String(companyName).trim() : "",
      businessType: businessType ? String(businessType).trim() : "",
      address: address ? String(address).trim() : "",
      phone: cleanPhone,
      status: "ያልተደወለ",
      comment: comment ? String(comment).trim() : "",
      uploadedBy: uploadedBy || "ያልታወቀ ሰራተኛ",
    });

    await newLead.save();
    res.status(201).json({ success: true, message: "ደንበኛው በስኬት ተመዝግቧል!", lead: newLead });
  } catch (error) {
    console.error("Direct lead creation error:", error);
    res.status(500).json({ success: false, error: "ደንበኛውን መመዝገብ አልተቻለም" });
  }
});

router.put("/sales/leads/:id", async (req, res) => {
  try {
    const { status, comment, salesPerson, updatedBy } = req.body;
    await Lead.findByIdAndUpdate(req.params.id, {
      status,
      comment,
      salesPerson,
      updatedBy: updatedBy || "ያልታወቀ ሰራተኛ",
    });
    res.status(200).json({ success: true, message: "መረጃው ተዘምኗል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ማዘመን አልተቻለም" });
  }
});

router.delete("/sales/leads/:id", async (req, res) => {
  try {
    const { deletedBy } = req.body;
    await Lead.findByIdAndUpdate(req.params.id, {
      deletedBy: deletedBy || "ያልታወቀ ሰራተኛ"
    });
    await Lead.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "መረጃው ተሰርዟል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ማጥፋት አልተቻለም" });
  }
});

router.delete("/sales/leads-bulk", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: "የሚጠፉ መረጃዎች አልተመረጡም!" });
    }
    await Lead.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ success: true, message: "የተመረጡት ደንበኞች በስኬት ተሰርዘዋል!" });
  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({ success: false, error: "በጅምላ ማጥፋት ላይ ስህተት ተፈጥሯል" });
  }
});

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

router.post("/admin/projects", async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "ፕሮጀክት መመዝገብ አልተቻለም" });
  }
});

router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ date: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: "ፕሮጀክቶችን ማምጣት አልተቻለም" });
  }
});

router.delete("/admin/projects/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "ፕሮጀክት ማጥፋት አልተቻለም" });
  }
});

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

router.get("/admin/messages", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ date: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: "መረጃዎችን ማምጣት አልተቻለም" });
  }
});

router.post("/admin/reply/:id", async (req, res) => {
  try {
    const { reply } = req.body;
    await Contact.findByIdAndUpdate(req.params.id, {
      reply: reply,
      status: "ምላሽ ተሰጥቷል",
    });
    res.status(200).json({ success: true, message: "ምላሽዎ በተሳካ ሁኔታ ተልኳል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ምላሽ መላክ አልተቻለም" });
  }
});

router.delete("/admin/messages/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "ማዘዣው ተሰርዟል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ማጥፋት አልተቻለም" });
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

// ==========================================
// USERS & CONTACTS MANAGEMENT
// ==========================================

router.get("/admin/users", async (req, res) => {
  try {
    const registeredUsers = await User.find({ role: "normal" })
      .select("-password")
      .lean();
    const chatEmails = await Contact.distinct("email");
    let finalUsersList = [...registeredUsers];

    for (const email of chatEmails) {
      const alreadyExists = finalUsersList.some((u) => u.email === email);
      const isMainAdmin = email === "mamaruanmaw@1925";

      if (!alreadyExists && !isMainAdmin) {
        const sampleContact = await Contact.findOne({ email });
        if (sampleContact) {
          finalUsersList.push({
            _id: sampleContact._id,
            name: sampleContact.name || "ስም የሌለው ደንበኛ",
            email: email,
            isBlocked: false,
            isChatOnly: true,
          });
        }
      }
    }

    res.status(200).json({ success: true, users: finalUsersList });
  } catch (error) {
    res.status(500).json({ success: false, error: "የደንበኞችን ዝርዝር ማጠናቀር አልተቻለም" });
  }
});

router.put("/admin/users/block/:id", async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (user) {
      await User.findByIdAndUpdate(userId, { isBlocked: isBlocked });
    } else {
      const contactData = await Contact.findById(userId);
      if (contactData) {
        const dummyPassword = await bcrypt.hash("BLOCKED_USER_PASS_123", 10);
        const blockedUser = new User({
          name: contactData.name,
          email: contactData.email,
          password: dummyPassword,
          role: "normal",
          isBlocked: isBlocked,
        });
        await blockedUser.save();
      }
    }

    res.status(200).json({ success: true, message: "የተጠቃሚው የብሎክ ሁኔታ ተቀይሯል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ብሎክ ማድረግ አልተሳካም" });
  }
});

router.delete("/admin/users/delete/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (user) {
      await User.findByIdAndDelete(userId);
    } else {
      await Contact.findByIdAndDelete(userId);
    }

    res.status(200).json({ success: true, message: "ተጠቃሚው ሙሉ በሙሉ ተሰርዟል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ተጠቃሚውን ማጥፋት አልተቻለም" });
  }
});

router.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const checkUser = await User.findOne({ email: cleanEmail });
    if (checkUser && checkUser.isBlocked) {
      return res.status(403).json({ success: false, error: "አካውንትዎ የታገደ በመሆኑ መልዕክት መላክ አይችሉም!" });
    }

    const newContact = new Contact({ name, email: cleanEmail, message });
    await newContact.save();
    res.status(201).json({ success: true, message: "ትዕዛዝዎ በስኬት ተቀምጧል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ትዕዛዙን ማስቀመጥ አልተቻለም" });
  }
});

router.post("/admin/send-new-message", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!email || !message) {
      return res.status(400).json({ success: false, error: "እባክዎ ኢሜይል እና መልዕክት በትክክል ያስገቡ!" });
    }
    const cleanEmail = email.toLowerCase().trim();

    const adminNewOrder = new Contact({
      name: name,
      email: cleanEmail,
      message: `[የባለሙያ መልዕክት]፦ ${message}`,
      reply: message,
      status: "ምላሽ ተሰጥቷል",
    });
    await adminNewOrder.save();
    res.status(201).json({ success: true, message: "መልዕክትዎ ለደንበኛው ተልኳል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "መልዕክት መላክ አልተቻለም" });
  }
});

// ==========================================
// SALES STAFF MANAGEMENT ROUTES
// ==========================================

router.post("/admin/sales", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "ይህ ኢሜይል ቀድሞ ተመዝግቧል!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newSales = new User({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: "sales",
    });

    await newSales.save();
    res.status(201).json({ success: true, message: "የሽያጭ ሰራተኛው በስኬት ተመዝግቧል!" });
  } catch (error) {
    console.error("Sales registration error:", error);
    res.status(500).json({ success: false, error: "ሰርቨር ላይ ስህተት ተፈጥሯል" });
  }
});

router.get("/admin/sales", async (req, res) => {
  try {
    const sales = await User.find({ role: "sales" }).select("-password");
    res.status(200).json({ success: true, sales });
  } catch (error) {
    res.status(500).json({ success: false, error: "የሽያጭ ሰራተኞችን ዝርዝር ማምጣት አልተቻለም" });
  }
});

router.delete("/admin/sales/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "የሽያጭ ሰራተኛው ተሰርዟል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ማጥፋት አልተቻለም" });
  }
});

router.put("/admin/sales/reset-password/:id", async (req, res) => {
  try {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.status(200).json({ success: true, message: "የሽያጭ ሰራተኛው ፓስወርድ ተቀይሯል!" });
  } catch (error) {
    res.status(500).json({ success: false, error: "ፓስወርድ መቀየር አልተቻለም" });
  }
});

module.exports = router;
