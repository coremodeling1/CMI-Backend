import Application from "../models/Application.js";
import User from "../models/User.js";
import Job from "../models/Job.js";
import cloudinary from "../config/cloudinary.js";

// Apply for a job
export const applyForJob = async (req, res) => {
  try {
    console.log("Incoming body:", req.body);
    console.log("Incoming file:", req.file);

    const {
      jobId,
      fullName,
      email,
      contact,
      qualifications,
      dob,
      city,
      state,
    } = req.body;
    const userId = req.user._id;

    let cvUrl = null;
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "raw",
              folder: "cvs",
              public_id: `cv_${Date.now()}.pdf`, // 👈 force .pdf
              use_filename: true,
              unique_filename: false,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });

      cvUrl = uploadResult.secure_url;
      console.log("Uploaded CV to Cloudinary:", cvUrl);
    }

    const application = new Application({
      user: userId,
      job: jobId,
      fullName,
      email,
      contact,
      qualifications,
      dob,
      city,
      state,
      cv: cvUrl,
    });

    await application.save();

    await User.findByIdAndUpdate(userId, { $push: { appliedJobs: jobId } });
    await Job.findByIdAndUpdate(jobId, { $push: { applicants: userId } });

    return res
      .status(201)
      .json({ message: "Application submitted successfully", application });
  } catch (error) {
    console.error("Error in applyForJob:", error);
    return res
      .status(500)
      .json({ error: "Server error while applying for job" });
  }
};

// Get applications for a user
export const getUserApplications = async (req, res) => {
  try {
    const { userId } = req.params;
    const applications = await Application.find({ user: userId }).populate(
      "job"
    );
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: "Error fetching applications" });
  }
};

// Get applicants for a job
export const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ job: jobId }).populate(
      "user",
      "name email status"
    );
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: "Error fetching applicants" });
  }
};
