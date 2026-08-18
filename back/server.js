const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { User } = require("./models");
const apiRoutes = require("./routes");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));

const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB በስኬት ተገናኝቷል!");
    seedFirstAdmin();
  })
  .catch((err) => console.error("❌ የዳታቤዝ ግንኙነት ስህተት:", err));

async function seedFirstAdmin() {
  try {
    const adminEmail = "mamaruanmaw@1925";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash("mame192513", 10);
      const firstAdmin = new User({
        name: "Mamaru Anmaw (Main Admin)",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      await firstAdmin.save();
      console.log("👑 የመጀመሪያው ዋና አድሚን በስኬት ዳታቤዝ ውስጥ ተፈጥሯል!");
    }
  } catch (error) {
    console.error("ዋናውን አድሚን መፍጠር አልተቻለም:", error);
  }
}

// Mount all routes with prefix /api
app.use("/api", apiRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "ሰርቨሩ ዝግጁ ነው!" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 ሰርቨር በፖርት ${PORT} ላይ ስራ ጀመረ!`));
