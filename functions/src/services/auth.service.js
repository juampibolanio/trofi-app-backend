const admin = require("../../config/firebase");
const bcrypt = require("bcrypt");
const axios = require("axios");
const {FIREBASE_API_KEY} = require("../../config/environment");

const db = admin.database();

class AuthService {
  // === REGISTRO DE USUARIO ===
  async register({name, email, password, phoneNumber}) {
    // Verificar si ya existe el usuario en Auth
    const existingUser = await admin
        .auth()
        .getUserByEmail(email)
        .catch(() => null);

    if (existingUser) {
      throw new Error("El usuario ya está registrado.");
    }

    // Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      displayName: name,
      email,
      password,
      phoneNumber: phoneNumber ? `+54${phoneNumber}` : undefined,
    });

    // Crear el objeto con datos base
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

    // Guardar en RTDB
    await db.ref(`users/${userRecord.uid}`).set(newUser);

    return newUser;
  }

  // === LOGIN DE USUARIO ===
  async login({email, password}) {
    if (!FIREBASE_API_KEY) {
      throw new Error("Falta configurar FIREBASE_WEB_API_KEY en .env");
    }

    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

    const {data} = await axios.post(
        url,
        {email, password, returnSecureToken: true},
        {timeout: 10000},
    );

    const {idToken, refreshToken, expiresIn, localId: uid} = data;

    // Traer perfil desde RTDB
    const snapshot = await db.ref(`users/${uid}`).get();
    const profile = snapshot.exists() ? snapshot.val() : null;

    return {
      idToken,
      refreshToken,
      expiresIn,
      uid,
      email: data.email,
      displayName: data.displayName || (profile && profile.name) || "",
      profile,
    };
  }

  // === LOGOUT ===
  async logout(uid) {
    await admin.auth().revokeRefreshTokens(uid);
    return {message: "Sesión cerrada correctamente."};
  }
}

module.exports = new AuthService();
