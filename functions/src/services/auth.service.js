/* eslint-disable max-len */
const admin = require("../../config/firebase");
const axios = require("axios");
const {FIREBASE_API_KEY} = require("../../config/environment");

const ConflictError = require("../errors/ConflictError");
const DataValidationError = require("../errors/DataValidationError");
const ResourceNotFoundError = require("../errors/ResourceNotFoundError");
const BaseError = require("../errors/BaseError");

const db = admin.database();

class AuthService {
  /**
   * Registra un nuevo usuario regular en Firebase y almacena
   * su perfil inicial en Realtime Database.
   * @param {Object} data
   */
  async register({name, email, password, phoneNumber}) {
    const existingUser = await admin
        .auth()
        .getUserByEmail(email)
        .catch(() => null);

    if (existingUser) {
      throw new ConflictError("El usuario ya está registrado.");
    }

    // Alta en Firebase Auth
    const userRecord = await admin.auth().createUser({
      displayName: name,
      email,
      password,
      phoneNumber: phoneNumber ? `+54${phoneNumber}` : undefined,
    });

    // Perfil inicial en RTDB
    const newUser = {
      uid: userRecord.uid,
      name,
      email,
      phoneNumber,
      userDescription: "",
      imageProfile: "",
      dni: "",
      location: "",
      is_worker: false,
      id_job: null,
      job_description: "",
      job_images: [],
      created_at: new Date().toISOString(),
    };

    await db.ref(`users/${userRecord.uid}`).set(newUser);

    return newUser;
  }

  /**
   * Inicia sesión mediante Firebase
   * Devuelve tokens + perfil del usuario.
   * @param {Object} data
   */
  async login({email, password}) {
    if (!FIREBASE_API_KEY) {
      throw new BaseError(
          "Falta configurar FIREBASE_WEB_API_KEY en el archivo .env",
          500,
      );
    }

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

    let response;
    try {
      response = await axios.post(
          url,
          {email, password, returnSecureToken: true},
          {timeout: 10000},
      );
    } catch (err) {
      throw new DataValidationError("Credenciales inválidas.");
    }

    const {idToken, refreshToken, expiresIn, localId: uid} = response.data;

    // Carga el perfil del usuario desde RTDB
    const snapshot = await db.ref(`users/${uid}`).get();
    const profile = snapshot.exists() ? snapshot.val() : null;

    return {
      idToken,
      refreshToken,
      expiresIn,
      uid,
      email: response.data.email,
      displayName: response.data.displayName || (profile ? profile.name : ""),
      profile,
    };
  }

  /**
   * Cierra la sesión invalidando los refresh tokens del usuario.
   * @param {string} uid
   */
  async logout(uid) {
    await admin.auth().revokeRefreshTokens(uid);
    return {message: "Sesión cerrada correctamente."};
  }

  /**
   * Envía un email con un enlace de reseteo de contraseña.
   * @param {string} email
   */
  async sendPasswordResetEmail(email) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${FIREBASE_API_KEY}`;

    try {
      const {data} = await axios.post(url, {
        requestType: "PASSWORD_RESET",
        email,
      });

      return data;
    } catch (err) {
      throw new ResourceNotFoundError("No existe una cuenta con ese email.");
    }
  }

  /**
   * Resetea la contraseña utilizando el código enviado por email.
   * @param {string} oobCode Código recibido por email
   * @param {string} newPassword Nueva contraseña
   */
  async resetPassword(oobCode, newPassword) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${FIREBASE_API_KEY}`;

    try {
      const {data} = await axios.post(url, {
        oobCode,
        newPassword,
      });

      return data;
    } catch (err) {
      throw new DataValidationError("Código inválido o expirado.");
    }
  }
}

module.exports = new AuthService();
