/* eslint-disable max-len */
const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema} = require("../schemas/auth.validation");

// Públicos
router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);

// Protegidos
router.get("/me", authMiddleware, AuthController.me);
router.post("/logout", authMiddleware, AuthController.logout);
router.post("/forgot-password", validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), AuthController.resetPassword);

module.exports = router;
