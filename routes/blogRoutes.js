import express from "express";
import Blog from "../models/Blog.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const router = express.Router();

// Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary upload helper
const streamUpload = (buffer, folder, resourceType) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Get all blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .populate("author", "name email");
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create blog (admin only)
router.post("/", protect, upload.single("media"), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to create blogs" });
    }

    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    let mediaUrl = null;
    let mediaType = null;
    let publicId = null;

    if (req.file) {
      const resourceType = req.file.mimetype.startsWith("video/")
        ? "video"
        : "image";

      const uploaded = await streamUpload(
        req.file.buffer,
        "blogs",
        resourceType
      );

      mediaUrl = uploaded.secure_url;
      mediaType = resourceType;
      publicId = uploaded.public_id;
    }

    const blog = new Blog({
      title,
      content,
      media: mediaUrl,
      mediaType,
      cloudinaryId: publicId,
      author: req.user._id,
    });

    const createdBlog = await blog.save();
    res.status(201).json(createdBlog);
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update blog (admin only)
router.put("/:id", protect, upload.single("media"), async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update blogs" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const { title, content } = req.body;
    if (title) blog.title = title;
    if (content) blog.content = content;

    if (req.file) {
      // Delete old media if exists
      if (blog.cloudinaryId) {
        await cloudinary.uploader.destroy(blog.cloudinaryId, {
          resource_type: blog.mediaType || "image",
        });
      }

      const resourceType = req.file.mimetype.startsWith("video/")
        ? "video"
        : "image";

      const uploaded = await streamUpload(
        req.file.buffer,
        "blogs",
        resourceType
      );

      blog.media = uploaded.secure_url;
      blog.mediaType = resourceType;
      blog.cloudinaryId = uploaded.public_id;
    }

    const updatedBlog = await blog.save();
    res.json(updatedBlog);
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Delete blog (admin only)
router.delete("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete blogs" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // ✅ If blog has media, remove from Cloudinary
    if (blog.media) {
      const parts = blog.media.split("/");
      const filename = parts[parts.length - 1].split(".")[0];
      const folder = "blogs"; // adjust if you used folders in Cloudinary
      const publicId = `${folder}/${filename}`;

      await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      });
    }

    await blog.deleteOne();
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
