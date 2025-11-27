/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */

const AuthService = require("../services/auth.service");
const {sendResponse} = require("../utils/responseHandler");
const AuthorizationError = require("../errors/AuthorizationError");
const ResourceNotFoundError = require("../errors/ResourceNotFoundError");
const {syncUser} = require("../services/analytics.service");
const admin = require("../../config/firebase");

/**
 * Registra un usuario normal (no worker).
 */
exports.register = async (req, res, next) => {
  try {
    const user = await AuthService.register(req.body);

    await syncUser({
      uid: user.uid,
      name: req.body.name,
      email: req.body.email,
      is_worker: false,
      created_at: new Date().toISOString(),
      job: null,
    });

    return sendResponse(res, 201, {
      message: "Usuario registrado correctamente.",
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login de usuario.
 * Devuelve tokens + perfil.
 */
exports.login = async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body);

    return sendResponse(res, 200, {
      message: `Bienvenido ${result.displayName || result.email}`,
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      uid: result.uid,
      email: result.email,
      profile: result.profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Devuelve el perfil del usuario autenticado.
 * Requiere auth middleware -> req.user.uid
 */
exports.me = async (req, res, next) => {
  try {
    const uid = req.user?.uid;
    if (!uid) throw new AuthorizationError("No autenticado.");

    const db = admin.database();
    const snapshot = await db.ref(`users/${uid}`).get();

    if (!snapshot.exists()) {
      throw new ResourceNotFoundError("Perfil no encontrado.");
    }

    return sendResponse(res, 200, {
      uid,
      profile: snapshot.val(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cierra sesión revocando los refresh tokens del usuario.
 */
exports.logout = async (req, res, next) => {
  try {
    const uid = req.user?.uid;
    if (!uid) throw new AuthorizationError("No autenticado.");

    await admin.auth().revokeRefreshTokens(uid);

    return sendResponse(res, 200, {
      message: "Logout exitoso. Tokens revocados.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Envía email con instrucción para resetear contraseña.
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    await AuthService.sendPasswordResetEmail(req.body.email);

    return sendResponse(res, 200, {
      message: "Se envió un email para restablecer la contraseña.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resetea la contraseña usando el código enviado al email.
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const {oobCode, newPassword} = req.body;

    await AuthService.resetPassword(oobCode, newPassword);

    return sendResponse(res, 200, {
      message: "Contraseña actualizada correctamente.",
    });
  } catch (error) {
    next(error);
  }
};
