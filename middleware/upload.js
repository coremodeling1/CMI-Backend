// middleware/upload.js
// middleware/upload.js
import multer from "multer";

const storage = multer.memoryStorage();

const allowed = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/avif",
  "video/mp4", "video/quicktime", "video/mpeg", "video/webm", "video/ogg", "video/x-matroska",
  "application/pdf" // ✅ allow PDF uploads for CV
]);

const fileFilter = (req, file, cb) => {
  if (allowed.has(file.mimetype)) cb(null, true);
  else cb(new Error("Unsupported file type"), false);
};

const upload = multer({ storage,  fileFilter });

export default upload;
