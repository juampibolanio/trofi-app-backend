/* eslint-disable new-cap */
/* eslint-disable max-len */
const express = require("express");

const router = express.Router();
const JobsController = require("../controllers/jobs.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {createJobSchema, updateJobSchema} = require("../schemas/jobs.validation");

// PÚBLICOS
router.get("/jobs", JobsController.getAllJobs);
router.get("/jobs/:id", JobsController.getJobById);

// PROTEGIDOS (requieren auth)
router.post("/jobs", authMiddleware, validate(createJobSchema), JobsController.createJob);
router.put("/jobs/:id", authMiddleware, validate(updateJobSchema), JobsController.updateJob);
router.delete("/jobs/:id", authMiddleware, JobsController.deleteJob);

module.exports = router;
