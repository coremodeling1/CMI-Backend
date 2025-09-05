import express from "express";
import { getArtists, updateArtistStatus, deleteArtistMedia } from "../controllers/artistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/artists → fetch all artists
router.get("/", protect, getArtists);

// PUT /api/artists/:id/status → update approval/rejection
router.put("/:id/status", protect, updateArtistStatus);

// DELETE /api/artists/:id/media → delete a gallery photo/video
router.delete("/:id/media", protect, deleteArtistMedia);

export default router;
