import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    // 🔹 Common for all users
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["artist", "recruiter", "admin"],
      required: true,
    },
    identity: { type: String }, // model, actor, dancer, etc.
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    description: { type: String },
    contact: { type: String },
    profilePic: { type: String },
    photos: [{ type: String }],
    videos: [{ type: String }],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    premiumStatus: {
      type: String,
      enum: ["granted", "denied", "none"],
      default: "none",
    },

    // 🔹 Common artist fields (asked at signup)
    gender: { type: String, enum: ["male", "female", "other"] },
    dob: { type: Date },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    language: { type: String },
    instagram: { type: String },
    instagramFollowers: { type: String },

    willingToTravel: { type: Boolean, default: false },
    experience: { type: String },
    internationalProjects: { type: Boolean, default: false },
    availabilityForCasting: { type: String },
    aboutYourself: { type: String },

    // 🔹 Identity-specific fields
    artistDetails: {
      model: {
        height: String,
        weight: String,
        bust: String,
        waist: String,
        hips: String,

        nightWear: { type: Boolean, default: false },
        bikiniSwimwear: { type: Boolean, default: false },
        boldSemiBoldWebSeries: { type: Boolean, default: false },
        nudeSemiNudeShoots: { type: Boolean, default: false },
        movieAdAlbumSongs: { type: Boolean, default: false },
        calendarShootsAds: { type: Boolean, default: false },
        tattoosOnBody: { type: Boolean, default: false },
      },

      // 🔁 Same as Model
      advertisingProfessional: {
        height: String,
        weight: String,
        bust: String,
        waist: String,
        hips: String,

        nightWear: { type: Boolean, default: false },
        bikiniSwimwear: { type: Boolean, default: false },
        boldSemiBoldWebSeries: { type: Boolean, default: false },
        nudeSemiNudeShoots: { type: Boolean, default: false },
        movieAdAlbumSongs: { type: Boolean, default: false },
        calendarShootsAds: { type: Boolean, default: false },
        tattoosOnBody: { type: Boolean, default: false },
      },

      actor: {
        height: String,
        weight: String,
        currentProject: String,

        boldScenes: { type: Boolean, default: false },
        semiNudeScenes: { type: Boolean, default: false },
        webSeries: { type: Boolean, default: false },
        movieAdAlbumSongs: { type: Boolean, default: false },
        calendarShootsAds: { type: Boolean, default: false },
        itemSongs: { type: Boolean, default: false },
        backgroundArtist: { type: Boolean, default: false },
        loveMakingScenes: { type: Boolean, default: false },
      },

      influencer: {
        brandPromotions: { type: Boolean, default: false },
        boldShoots: { type: Boolean, default: false },
        reelsAds: { type: Boolean, default: false },
      },

      photographer: {
        boldShoots: { type: Boolean, default: false },
        semiNudeShoots: { type: Boolean, default: false },
        calendarShootsAds: { type: Boolean, default: false },
      },

      filmmaker: {
        itemSongs: { type: Boolean, default: false },
        loveMakingScenes: { type: Boolean, default: false },
        boldScenes: { type: Boolean, default: false },
        movieAdsAlbumShoots: { type: Boolean, default: false },
      },

      dancer: {
        backgroundRole: { type: Boolean, default: false },
        itemSongs: { type: Boolean, default: false },
        boldShoots: { type: Boolean, default: false },
        movieAdsAlbumSongs: { type: Boolean, default: false },
      },

      singer: {
        genres: String,
        multipleLanguages: { type: Boolean, default: false },
        industryExperience: String,
      },

      musician: {
        instruments: String,
        adaptableStyles: { type: Boolean, default: false },
      },

      stylist: {
        experienceInStyling: String,
        comfortableOnSet: { type: Boolean, default: false },
      },
    },

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
