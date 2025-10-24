const AuthService = require("../services/auth.service");
const {sendResponse, sendError} = require("../utils/responseHandler");
const {httpStatusCodes, AuthorizationError, ResourceNotFoundError} = require("../utils/httpStatusCodes");

const admin = require("../../config/firebase");

exports.register = async (req, res) => {
  try {
    const {name, email, password, phoneNumber} = req.body;

    if (!name || !email || !password || !phoneNumber) {
      return sendError(
          res,
          httpStatusCodes.badRequest,
          "Faltan datos obligatorios.",
      );
    }

    const user = await AuthService.register({
      name,
      email,
      password,
      phoneNumber,
    });

    return sendResponse(res, httpStatusCodes.created, {
      message: "Usuario registrado correctamente.",
      user,
    });
  } catch (error) {
    console.error("❌ Error en register:", error.message);
    return sendError(res, httpStatusCodes.internalServerError, error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const {email, password} = req.body || {};
    if (!email || !password) {
      return sendError(
          res,
          httpStatusCodes.badRequest,
          "Email y password son obligatorios.",
      );
    }

    const result = await AuthService.login({email, password});

    return sendResponse(res, httpStatusCodes.ok, {
      message: `Hola! ${result.displayName || result.email}`,
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      uid: result.uid,
      email: result.email,
      profile: result.profile,
    });
  } catch (error) {
    const msg =
      error?.response?.data?.error?.message ||
      error.message ||
      "Error en login";
    const status =
      msg === "EMAIL_NOT_FOUND" || msg === "INVALID_PASSWORD" ?
        httpStatusCodes.unautorized :
        httpStatusCodes.internalServerError;

    return sendError(res, status, msg);
  }
};

// Devuelve el perfil del usuario autenticado
exports.me = async (req, res, next) => {
  try {
    const uid = req.user?.uid;

    if (!uid) {
      throw new AuthorizationError("No autenticado: token inválido o ausente.");
    }

    const db = admin.database();
    const snapshot = await db.ref(`users/${uid}`).get();

    if (!snapshot.exists()) {
      throw new ResourceNotFoundError("Perfil no encontrado en la base de datos.");
    }

    const profile = snapshot.val();

    return sendResponse(res, httpStatusCodes.ok, {uid, profile});
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const uid = req.user?.uid;

    if (!uid) {
      throw new AuthorizationError("No autenticado: token inválido o ausente.");
    }

    await admin.auth().revokeRefreshTokens(uid);

    return sendResponse(res, httpStatusCodes.ok, {
      message: "Logout exitoso. Tokens revocados correctamente.",
    });
  } catch (error) {
    next(error);
  }
};
