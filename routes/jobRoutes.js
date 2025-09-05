import express from "express";
import { createJob, getJobs, updateJobStatus, getApprovedJobs, deleteJob} from "../controllers/jobController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST a job (recruiter only)
router.post("/", protect, createJob);

// GET all jobs
router.get("/", protect, getJobs);

// GET only approved jobs
router.get("/approved", getApprovedJobs);

// PUT /api/jobs/:id/status → approve/reject
router.put("/:id/status", protect, updateJobStatus);

router.delete("/:id", protect, deleteJob);


export default router;
