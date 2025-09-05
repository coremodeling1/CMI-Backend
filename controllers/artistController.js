import User from "../models/User.js";
import Application from "../models/Application.js";
import cloudinary from "../config/cloudinary.js";

// Get all artists
export const getArtists = async (req, res) => {
  try {
    let artists;

    if (req.user && req.user.role === "admin") {
      artists = await User.find({ role: "artist" }).select("-password");
    } else {
      artists = await User.find({ role: "artist", status: "approved" }).select("-password");
    }

    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update artist status (approved/rejected)
export const updateArtistStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const artist = await User.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    artist.status = status;
    await artist.save();

    await Application.updateMany(
      { user: artist._id },
      { $set: { status } }
    );

    res.json({ message: `Artist ${status} successfully`, artist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Delete artist media (photo or video) as admin
export const deleteArtistMedia = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { id } = req.params;   // artist ID
    const { url, type } = req.body; // URL and type ("photo" or "video")

    if (!url || !type) {
      return res.status(400).json({ message: "URL and type are required" });
    }

    const artist = await User.findById(id);
    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    // ✅ Extract Cloudinary public_id from URL
    const parts = url.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    // adjust folder path based on how you upload (this assumes `users/<artistId>/...`)
    const folder = `users/${artist._id}`;
    const publicId = `${folder}/${filename}`;

    // ✅ Delete from Cloudinary
    const resource_type = type === "video" ? "video" : "image";
    await cloudinary.uploader.destroy(publicId, { resource_type });

    // ✅ Remove from MongoDB
    if (type === "photo") {
      artist.photos = artist.photos.filter((p) => p !== url);
    } else if (type === "video") {
      artist.videos = artist.videos.filter((v) => v !== url);
    } else {
      return res.status(400).json({ message: "Invalid media type" });
    }

    await artist.save();

    res.json({
      message: `${type} deleted successfully`,
      photos: artist.photos,
      videos: artist.videos,
    });
  } catch (error) {
    console.error("Admin deleteArtistMedia error:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};