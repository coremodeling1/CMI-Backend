import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import User from "../models/User.js";

const router = express.Router();

// ✅ Upload single photo or video
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const type = req.body.type || "photo";
    const resource_type = type === "photo" ? "image" : "video";

    const streamUpload = (reqFile) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type, folder: `users/${user._id}` },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        streamifier.createReadStream(reqFile.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file);

    if (type === "photo") user.photos.push(result.secure_url);
    else user.videos.push(result.secure_url);

    await user.save();

    res.json({ photos: user.photos, videos: user.videos, name: user.name });
  } catch (error) {
    console.error("Upload route error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

// ✅ Get logged-in user's gallery (approved artists only)
router.get("/gallery", protect, async (req, res) => {
  try {
    // 🔒 BLOCK unapproved artists
    if (req.user.role === "artist" && req.user.status !== "approved") {
      return res.status(403).json({
        message: "Gallery access is locked until profile approval",
      });
    }

    const user = await User.findById(req.user.id).select(
      "photos videos name"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      photos: user.photos,
      videos: user.videos,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});


// ✅ Delete photo/video
router.delete("/delete", protect, async (req, res) => {
  try {
    const { url, type } = req.body;
    if (!url || !type) {
      return res.status(400).json({ message: "URL and type are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Extract Cloudinary public_id from the URL
    const parts = url.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    const folder = `users/${user._id}`;
    const publicId = `${folder}/${filename}`;

    // Delete from Cloudinary
    const resource_type = type === "photo" ? "image" : "video";
    await cloudinary.uploader.destroy(publicId, { resource_type });

    // Remove from MongoDB user document
    if (type === "photo") {
      user.photos = user.photos.filter((p) => p !== url);
    } else {
      user.videos = user.videos.filter((v) => v !== url);
    }

    await user.save();

    res.json({ photos: user.photos, videos: user.videos, name: user.name });
  } catch (err) {
    console.error("Delete route error:", err);
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});





export default router;
