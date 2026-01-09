// routes/authRoutes.js
import express from "express";
import { signup, login, updateUserProfile, changePassword, getAllRecruiters, updatePremiumStatus, getMyProfile } from "../controllers/authController.js";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js"; // ✅ import protect


const router = express.Router();

// ✅ Signup (profilePic + multiple files)
router.post(
  "/signup",
  upload.fields([
    { name: "profilePic", maxCount: 1 }, // single profile picture
    { name: "files", maxCount: 10 },     // multiple photos/videos
  ]),
  signup
);

// ✅ Login
router.post("/login", login);

// ✅ Update Profile (protected)
router.put(
  "/profile",
  protect, // ✅ must come before upload
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "files", maxCount: 10 },
  ]),
  updateUserProfile
);

router.put("/change-password", protect, changePassword); // ✅ new route

router.get("/recruiters", getAllRecruiters);

router.put("/recruiters/:recruiterId/premium", protect, updatePremiumStatus);

// ✅ Get logged-in user profile
router.get("/profile", protect, getMyProfile);


export default router;
