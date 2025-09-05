import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, enum: ["artist", "recruiter", "admin"], required: true },
    identity: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    description: { type: String },
    contact: { type: String },
    profilePic: { type: String },
    photos: [{ type: String }],
    videos: [{ type: String }],
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    premiumStatus: {
  type: String,
  enum: ["granted", "denied", "none"],
  default: "none",
},
    // ✅ Artist-only fields
    gender: { type: String, enum: ["male", "female", "other"] },
    dob: { type: Date },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    language: { type: String },
    instagram: { type: String },   // ✅ Added Instagram field
    instagramFollowers: { type: String },  // ✅ NEW
     // ✅ Add premium flag
    

    appliedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
      },
    ],
  },
  { timestamps: true }
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
