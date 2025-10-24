const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {registerSchema, loginSchema} = require("../schemas/auth.validation");

// Públicos
router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);

// Protegidos
router.get("/me", authMiddleware, AuthController.me);
router.post("/logout", authMiddleware, AuthController.logout);
module.exports = router;
