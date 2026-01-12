// controllers/authController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const signup = async (req, res) => {
  try {
    const {
      name,
      role,
      identity,
      email,
      password,
      description,
      contact,
      gender,
      dob,
      city,
      state,
      country,
      language,
      instagram,
      instagramFollowers,

      // 🔽 Common artist fields
      willingToTravel,
      experience,
      internationalProjects,
      availabilityForCasting,
      aboutYourself,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    let profilePicUrl = "";
    let photos = [];
    let videos = [];

    if (req.files?.profilePic?.[0]) {
      const uploadRes = await uploadBufferToCloudinary(
        req.files.profilePic[0].buffer,
        {
          folder: "profile_pics",
          resourceType: "image",
        }
      );
      profilePicUrl = uploadRes.secure_url;
    }

    if (req.files?.files?.length > 0 && identity) {
      const photoIdentities = [
        "model",
        "actor",
        "influencer",
        "writer",
        "stylist",
        "photographer",
        "advertising professional",
      ];
      const videoIdentities = [
        "singer",
        "musician",
        "dancer",
        "anchor",
        "voice-over artist",
        "filmmaker",
        "standup-comedian",
      ];

      const uploads = await Promise.all(
        req.files.files.map((file) =>
          uploadBufferToCloudinary(file.buffer, {
            folder: `artists/${identity}`,
            resourceType: photoIdentities.includes(identity)
              ? "image"
              : "video",
          })
        )
      );

      if (photoIdentities.includes(identity)) {
        photos = uploads.map((u) => u.secure_url);
      } else if (videoIdentities.includes(identity)) {
        videos = uploads.map((u) => u.secure_url);
      }
    }

    const user = await User.create({
      name,
      role,
      identity,
      email,
      password,
      description,

      contact: role === "artist" ? contact : undefined,
      gender: role === "artist" ? gender : undefined,
      dob: role === "artist" ? dob : undefined,
      city: role === "artist" ? city : undefined,
      state: role === "artist" ? state : undefined,
      country: role === "artist" ? country : undefined,
      language: role === "artist" ? language : undefined,

      instagram: role === "artist" ? instagram : undefined,
      instagramFollowers: role === "artist" ? instagramFollowers : undefined,

      // 🔽 Save common artist fields
      willingToTravel:
        role === "artist"
          ? typeof willingToTravel === "boolean"
            ? willingToTravel
            : willingToTravel === "true"
          : undefined,

      internationalProjects:
        role === "artist"
          ? typeof internationalProjects === "boolean"
            ? internationalProjects
            : internationalProjects === "true"
          : undefined,

      experience: role === "artist" ? experience : undefined,
      availabilityForCasting:
        role === "artist" ? availabilityForCasting : undefined,
      aboutYourself: role === "artist" ? aboutYourself : undefined,

      profilePic: profilePicUrl,
      photos,
      videos,
      premiumStatus: "none",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      role: user.role,
      identity: user.identity,
      email: user.email,
      contact: user.contact,
      gender: user.gender,
      dob: user.dob,
      city: user.city,
      state: user.state,
      country: user.country,
      language: user.language,
      instagram: user.instagram,
      instagramFollowers: user.instagramFollowers,
      willingToTravel: user.willingToTravel,
      experience: user.experience,
      internationalProjects: user.internationalProjects,
      availabilityForCasting: user.availabilityForCasting,
      aboutYourself: user.aboutYourself,
      profilePic: user.profilePic,
      photos: user.photos,
      videos: user.videos,
      description: user.description,
      premiumStatus: user.premiumStatus,
      token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      }),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    res.json({
      _id: user._id,
      name: user.name,
      role: user.role,
      identity: user.identity,
      email: user.email,
      contact: user.contact,
      gender: user.gender,
      dob: user.dob,
      city: user.city,
      state: user.state,
      country: user.country,
      language: user.language,
      profilePic: user.profilePic, // ✅ ADD THIS LINE
      photos: user.photos,
      videos: user.videos,
      description: user.description,
      instagram: user.instagram, // ✅ send IG link back in response
      instagramFollowers: user.instagramFollowers, // ✅ NEW
      premiumStatus: user.premiumStatus, // ✅ add this
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT middleware
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      name,
      email,
      description,
      contact,
      gender,
      dob,
      city,
      state,
      country,
      language,
      role,
      identity,
      instagram,
      instagramFollowers,

      // 🔽 Common artist fields
      willingToTravel,
      experience,
      internationalProjects,
      availabilityForCasting,
      aboutYourself,

      // 🔽 Identity-specific block (JSON string from frontend)
      identityDetails,
    } = req.body;

    // Basic fields
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (identity !== undefined) user.identity = identity;

    if (description !== undefined) user.description = description;
    if (contact !== undefined) user.contact = contact;
    if (gender !== undefined) user.gender = gender;
    if (dob !== undefined) user.dob = dob;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (country !== undefined) user.country = country;
    if (language !== undefined) user.language = language;

    // Artist-only fields
    if (user.role === "artist") {
      if (instagram !== undefined) user.instagram = instagram;
      if (instagramFollowers !== undefined)
        user.instagramFollowers = instagramFollowers;

      if (willingToTravel !== undefined) user.willingToTravel = willingToTravel;
      if (experience !== undefined) user.experience = experience;
      if (internationalProjects !== undefined)
        user.internationalProjects = internationalProjects;
      if (availabilityForCasting !== undefined)
        user.availabilityForCasting = availabilityForCasting;
      if (aboutYourself !== undefined) user.aboutYourself = aboutYourself;

      // 🔽 Identity-specific data
      if (identity && identityDetails) {
        if (!user.artistDetails) user.artistDetails = {};

        const allowed = [
          "model",
          "advertisingProfessional",
          "actor",
          "photographer",
          "filmmaker",
          "dancer",
          "singer",
          "musician",
          "stylist",
        ];

        if (allowed.includes(identity)) {
          user.artistDetails[identity] = JSON.parse(identityDetails);
        }
      }
    }

    // ✅ Profile Pic Upload
    if (req.files?.profilePic?.[0]) {
      const uploadRes = await uploadBufferToCloudinary(
        req.files.profilePic[0].buffer,
        {
          folder: "profile_pics",
          resourceType: "image",
        }
      );
      user.profilePic = uploadRes.secure_url;
    }

    // ✅ Extra Photos / Videos Upload
    if (req.files?.files?.length > 0) {
      const uploads = await Promise.all(
        req.files.files.map((file) =>
          uploadBufferToCloudinary(file.buffer, {
            folder: `artists/${user.identity}`,
            resourceType: file.mimetype.startsWith("image") ? "image" : "video",
          })
        )
      );

      const uploadedUrls = uploads.map((u) => u.secure_url);

      if (user.identity) {
        if (
          [
            "model",
            "actor",
            "influencer",
            "writer",
            "stylist",
            "photographer",
            "advertising professional",
          ].includes(user.identity)
        ) {
          user.photos = [...user.photos, ...uploadedUrls];
        } else {
          user.videos = [...user.videos, ...uploadedUrls];
        }
      }
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      identity: updatedUser.identity,
      profilePic: updatedUser.profilePic,
      photos: updatedUser.photos,
      videos: updatedUser.videos,
      description: updatedUser.description,
      contact: updatedUser.contact,
      gender: updatedUser.gender,
      dob: updatedUser.dob,
      city: updatedUser.city,
      state: updatedUser.state,
      country: updatedUser.country,
      language: updatedUser.language,
      instagram: updatedUser.instagram,
      instagramFollowers: updatedUser.instagramFollowers,

      // 🔽 New common artist fields
      willingToTravel: updatedUser.willingToTravel,
      experience: updatedUser.experience,
      internationalProjects: updatedUser.internationalProjects,
      availabilityForCasting: updatedUser.availabilityForCasting,
      aboutYourself: updatedUser.aboutYourself,

      // 🔽 All identity-specific data
      artistDetails: updatedUser.artistDetails,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Change Password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT middleware
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both old and new password are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // check old password
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // set new password (will trigger bcrypt pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({
      message:
        "Password updated successfully. Please login again with new password.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all recruiters (admin-only ideally)
export const getAllRecruiters = async (req, res) => {
  try {
    const recruiters = await User.find({ role: "recruiter" }).select(
      "name email contact profilePic  premiumStatus"
    );
    res.json(recruiters);
  } catch (error) {
    console.error("Error fetching recruiters:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update recruiter premium status
export const updatePremiumStatus = async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const { premiumStatus } = req.body;

    if (!["granted", "denied"].includes(premiumStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const recruiter = await User.findById(recruiterId);
    if (!recruiter || recruiter.role !== "recruiter") {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    recruiter.premiumStatus = premiumStatus;
    await recruiter.save();

    res.json({ message: "Premium status updated", recruiter });
  } catch (error) {
    console.error("Error updating premium status:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get logged-in user profile
export const getMyProfile = async (req, res) => {
  try {
    // req.user is already set by protect middleware
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user); // ✅ includes status
  } catch (error) {
    console.error("getMyProfile error:", error.message);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
