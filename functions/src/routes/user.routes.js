/* eslint-disable max-len */
/* eslint-disable new-cap */
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/user.controller");
const validate = require("../middlewares/validate.middleware");
const auth = require("../middlewares/auth.middleware");

const {
  updateNameSchema,
  updateUserDescriptionSchema,
  updateJobDescriptionSchema,
  updateLocationSchema,
  updatePhoneSchema,
} = require("../schemas/user.validation");

/* =========================== PERFILES =========================== */

// Obtener perfil por email o UID
router.get("/profile/email/:email", usersController.getProfileByEmail);
router.get("/profile/uid/:uid", usersController.getProfileByUid);

// Perfil del usuario autenticado
router.get("/me", auth, usersController.getMe);

/* ===================== ACTUALIZACIÓN GENERAL ===================== */

router.put("/update/:uid", usersController.updateProfile);

/* ==================== ACTUALIZACIONES SIMPLES ==================== */

router.put("/update/name/:uid", validate(updateNameSchema), usersController.updateName);
router.put("/update/user-description/:uid", validate(updateUserDescriptionSchema), usersController.updateUserDescription);
router.put("/update/job-description/:uid", validate(updateJobDescriptionSchema), usersController.updateJobDescription);
router.put("/update/location/:uid", validate(updateLocationSchema), usersController.updateLocation);
router.put("/update/phone/:uid", validate(updatePhoneSchema), usersController.updatePhone);


/* ============================ IMÁGENES ============================ */

// Subir imagen de trabajo
router.post("/photos/:uid", usersController.uploadJobPhoto);

// Eliminar imagen de trabajo
router.delete("/photos/:uid", usersController.deleteJobPhoto);

// Actualizar foto de perfil
router.put("/profile-photo/:uid", usersController.updateProfilePic);

// Obtener solo URLs de fotos del usuario
router.get("/photos/user/:uid", usersController.getUserPhotos);

/* ============================ WORKERS ============================ */

// Registro de trabajador
router.post("/worker/register", usersController.registerWorker);

// Actualizar perfil completo de worker
router.put("/worker/update/:uid", usersController.updateProfileWorker);

// Listado de todos los workers
router.get("/workers", usersController.getAllWorkers);

// Búsqueda filtrada de workers
router.get("/workers/search", usersController.searchWorkers);

module.exports = router;
