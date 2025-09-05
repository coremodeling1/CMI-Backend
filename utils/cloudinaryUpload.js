// utils/cloudinaryUpload.js
import cloudinary from "../config/cloudinary.js";

export function uploadBufferToCloudinary(buffer, { folder, resourceType = "auto" } = {}) {
  return new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    upload.end(buffer);
  });
}
