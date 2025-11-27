/* eslint-disable new-cap */
/* eslint-disable max-len */
const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require("../schemas/auth.validation");

// -------------------- RUTAS PÚBLICAS --------------------

// Registro de usuario con validación de datos
router.post("/register", validate(registerSchema), AuthController.register);

// Login de usuario con validación de datos
router.post("/login", validate(loginSchema), AuthController.login);

// -------------------- RUTAS PROTEGIDAS (requieren autenticación) --------------------

// Obtener perfil del usuario autenticado
router.get("/me", authMiddleware, AuthController.me);

// Cerrar sesión del usuario autenticado
router.post("/logout", authMiddleware, AuthController.logout);

// -------------------- RECUPERACIÓN DE CONTRASEÑA --------------------

// Solicitar enlace de reseteo de contraseña
router.post("/forgot-password", validate(forgotPasswordSchema), AuthController.forgotPassword);

// Restablecer contraseña usando código enviado por email
router.post("/reset-password", validate(resetPasswordSchema), AuthController.resetPassword);

module.exports = router;
