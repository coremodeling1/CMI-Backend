import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    jobDescription: { type: String, required: true },
    requiredArtist: { type: String, required: true },
    recruiterName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    address: { type: String, required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }, 
    
    applicants: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],// ✅
  },
  
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
