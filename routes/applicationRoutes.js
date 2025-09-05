import express from "express";
import { applyForJob, getUserApplications, getJobApplicants } from "../controllers/applicationController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// POST apply for job (with CV upload)
router.post("/apply", upload.single("cv"), applyForJob);

// GET applications by user
router.get("/user/:userId", getUserApplications);

// GET applicants by job
router.get("/job/:jobId", getJobApplicants);

export default router;
