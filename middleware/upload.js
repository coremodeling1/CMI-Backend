// middleware/upload.js
// middleware/upload.js
import multer from "multer";

const storage = multer.memoryStorage();

const allowed = new Set([
  "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/avif",
  "video/mp4", "video/quicktime", "video/mpeg", "video/webm", "video/ogg", "video/x-matroska",
  // PDFs (different browsers send different mimetypes)
  "application/pdf",
  "application/octet-stream"
]);

const fileFilter = (req, file, cb) => {
  const type = (file.mimetype || "").toLowerCase();

  // Allow all images
  if (type.startsWith("image/")) {
    return cb(null, true);
  }

  // Allow common video types
  const videoTypes = [
    "video/mp4",
    "video/quicktime",
    "video/mpeg",
    "video/webm",
    "video/ogg",
    "video/x-matroska",
  ];

  if (videoTypes.includes(type)) {
    return cb(null, true);
  }

  // Allow PDFs and unknown binaries
  if (type === "application/pdf" || type === "application/octet-stream") {
    return cb(null, true);
  }

  console.log("Rejected mimetype:", file.mimetype);
  cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
};


const upload = multer({ storage,  fileFilter });

export default upload;
