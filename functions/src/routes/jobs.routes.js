/* eslint-disable new-cap */
/* eslint-disable max-len */
const express = require("express");

const router = express.Router();
const JobsController = require("../controllers/jobs.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {createJobSchema, updateJobSchema} = require("../schemas/jobs.validation");

// -------------------- RUTAS PÚBLICAS --------------------

// Obtener todos los trabajos
router.get("/jobs", JobsController.getAllJobs);

// Obtener un trabajo específico por ID
router.get("/jobs/:id", JobsController.getJobById);

// -------------------- RUTAS PROTEGIDAS (requieren autenticación) --------------------

// Crear un nuevo trabajo (requiere token y body válido)
router.post("/jobs", authMiddleware, validate(createJobSchema), JobsController.createJob);

// Actualizar un trabajo existente por ID (requiere token y body válido)
router.put("/jobs/:id", authMiddleware, validate(updateJobSchema), JobsController.updateJob);

// Eliminar un trabajo por ID (requiere token)
router.delete("/jobs/:id", authMiddleware, JobsController.deleteJob);

module.exports = router;
