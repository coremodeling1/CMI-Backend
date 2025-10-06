import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import artistRoutes from "./routes/artistRoutes.js";
import User from "./models/User.js";
import jobRoutes from "./routes/jobRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express();

// ✅ CORS configuration
const allowedOrigins = [
  "https://www.coremodellingindia.in",
  "http://localhost:3000", // optional: allow local dev too
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // if using cookies or auth headers
  })
);

// Middleware
app.use(express.json());

// Serve uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/users", userRoutes);

// Pre-create admin if not exists
const createAdmin = async () => {
  const adminExists = await User.findOne({ email: "admin@gmail.com" });
  if (!adminExists) {
    await User.create({
      name: "Admin",
      role: "admin",
      email: "admin@gmail.com",
      password: "admin123",
    });
    console.log("Admin user created: admin@gmail.com / admin123");
  }
};
createAdmin();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
