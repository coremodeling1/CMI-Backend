import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    fullName: String,
    email: String,
    contact: String,
    qualifications: String,
    dob: String,
    city: String,
    state: String,
    cv: String, // will store Cloudinary URL or local path
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;
