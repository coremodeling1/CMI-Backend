import Job from "../models/Job.js";




// Create a new job (recruiter only)
export const createJob = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can post jobs" });
    }

    const { jobTitle, jobDescription, requiredArtist, recruiterName, contactEmail, contactPhone, address } = req.body;

    const newJob = await Job.create({
      jobTitle,
      jobDescription,
      requiredArtist,
      recruiterName,
      contactEmail,
      contactPhone,
      address,
      postedBy: user._id,
    });

    res.status(201).json(newJob);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("postedBy", "name email");
    res.json(jobs); // ✅ includes status automatically
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update job status (approve/reject) - admin only
export const updateJobStatus = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can update job status" });
    }

    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.status = status;
    await job.save();

    res.json(job); // ✅ returns updated job with new status
  } catch (error) {
    console.error("Error updating job status:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Get only approved jobs
export const getApprovedJobs = async (req, res) => {
  try {
    const approvedJobs = await Job.find({ status: "approved" }).populate(
      "postedBy",
      "name email"
    );
    res.json(approvedJobs);
  } catch (error) {
    console.error("Error fetching approved jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Delete a job (only the recruiter who posted it)
export const deleteJob = async (req, res) => {
  try {
    const user = req.user;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if current user is recruiter and owner of the job
    if (user.role !== "recruiter" || job.postedBy.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this job" });
    }

    await job.deleteOne();

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ message: "Server error" });
  }
};






