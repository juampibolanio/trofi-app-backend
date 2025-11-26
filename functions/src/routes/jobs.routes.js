const express = require("express");

const router = express.Router();
const JobsController = require("../controllers/jobs.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {createJobSchema, updateJobSchema} = require("../schemas/jobs.validation");

// PÚBLICOS
router.get("/", JobsController.getAllJobs);
router.get("/:id", JobsController.getJobById);

// PROTEGIDOS (requieren auth)
router.post("", authMiddleware, validate(createJobSchema), JobsController.createJob);
router.put("/:id", authMiddleware, validate(updateJobSchema), JobsController.updateJob);
router.delete("/:id", authMiddleware, JobsController.deleteJob);

module.exports = router;