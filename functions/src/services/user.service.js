/* eslint-disable valid-jsdoc */
/* eslint-disable camelcase */
/* eslint-disable max-len */
/*
 * UserService
 * - Servicio para operaciones sobre usuarios/trabajadores
 */

const admin = require("../../config/firebase");
const db = admin.database();

const ConflictError = require("../errors/ConflictError");
const ResourceNotFoundError = require("../errors/ResourceNotFoundError");
const DataValidationError = require("../errors/DataValidationError");
const DatabaseError = require("../errors/DatabaseError");

function getNextId(array) {
  if (!Array.isArray(array) || array.length === 0) return 1;
  const ids = array.map((a) => a.id || 0);
  return Math.max(...ids) + 1;
}

class UserService {
  /**
   * Crea un usuario trabajador en Firebase Auth y RTDB.
   */
  async createUserWork(data) {
    try {
      const existingUser = await admin
          .auth()
          .getUserByEmail(data.email)
          .catch(() => null);

      if (existingUser) {
        throw new ConflictError("El email ya se encuentra registrado.");
      }

      const phoneNumber = data.phoneNumber ? `+54${data.phoneNumber}` : undefined;

      const workerRecord = await admin.auth().createUser({
        displayName: data.name,
        email: data.email,
        password: data.password,
        phoneNumber,
      });

      const newWorker = {
        uid: workerRecord.uid,
        name: data.name || "",
        email: data.email,
        phoneNumber: data.phoneNumber || "",
        userDescription: data.userDescription || "",
        imageProfile: data.imageProfile || "",
        dni: data.dni || "",
        location: data.location || "",
        is_worker: true,
        id_job: data.id_job ?? null,
        job_description: data.job_description || "",
        job_images: Array.isArray(data.job_images) ? data.job_images : [],
        created_at: new Date().toISOString(),
      };

      await db.ref(`users/${workerRecord.uid}`).set(newWorker);

      return newWorker;
    } catch (err) {
      if (err instanceof ConflictError || err instanceof DataValidationError) throw err;
      throw new DatabaseError(err.message || "Error creando usuario trabajador");
    }
  }

  /**
   * Obtiene perfil por email.
   * Lanza ResourceNotFoundError si no existe usuario en Auth/RTDB.
   */
  async getUserProfileByEmail(email) {
    if (!email) throw new DataValidationError("El email es requerido.");

    try {
      const resultUser = await admin.auth().getUserByEmail(email).catch(() => null);
      if (!resultUser) throw new ResourceNotFoundError("Usuario no encontrado por email.");

      const snapshot = await db.ref(`users/${resultUser.uid}`).get();
      if (!snapshot.exists()) {
        return {uid: resultUser.uid, email: resultUser.email};
      }

      return snapshot.val();
    } catch (err) {
      if (err instanceof ResourceNotFoundError || err instanceof DataValidationError) throw err;
      throw new DatabaseError(err.message || "Error obteniendo perfil por email");
    }
  }

  /**
   * Obtiene perfil por UID.
   * Lanza ResourceNotFoundError si no existe.
   */
  async getUserProfileByUid(uid) {
    if (!uid) throw new DataValidationError("UID requerido");

    try {
      const snap = await db.ref(`users/${uid}`).get();
      if (!snap.exists()) throw new ResourceNotFoundError("Usuario no encontrado por UID");
      return snap.val();
    } catch (err) {
      if (err instanceof ResourceNotFoundError || err instanceof DataValidationError) throw err;
      throw new DatabaseError(err.message || "Error obteniendo perfil por UID");
    }
  }

  /**
   * Actualiza perfil básico por UID.
   * Asume que los campos pasaron validación en el schema Joi.
   */
  async updateProfileByUid(uid, data) {
    if (!uid) throw new DataValidationError("UID requerido");

    // Construir objeto con campos permitidos; si un campo no se envía, queda fuera.
    const allowed = {
      dni: data.dni ?? undefined,
      userDescription: data.userDescription ?? undefined,
      imageProfile: data.imageProfile ?? undefined,
      location: data.location ?? undefined,
      phoneNumber: data.phoneNumber ?? undefined,
      name: data.name ?? undefined,
    };

    // Eliminar undefined
    Object.keys(allowed).forEach((k) => allowed[k] === undefined && delete allowed[k]);

    try {
      await db.ref(`users/${uid}`).update(allowed);
      const profileSnapshot = await db.ref(`users/${uid}`).get();
      if (!profileSnapshot.exists()) throw new ResourceNotFoundError("Usuario no encontrado al actualizar perfil");
      return profileSnapshot.val();
    } catch (err) {
      if (err instanceof ResourceNotFoundError || err instanceof DataValidationError) throw err;
      throw new DatabaseError(err.message || "Error actualizando perfil");
    }
  }

  /**
   * Agrega una foto (url) al array job_images usando transacción.
   * Devuelve el objeto imagen recién insertado {id, url}.
   */
  async uploadJobPhoto(uid, photoUrl) {
    if (!uid) throw new DataValidationError("UID no ingresado");
    if (!photoUrl || typeof photoUrl !== "string") throw new DataValidationError("URL de imagen inválida");

    const ref = db.ref(`users/${uid}/job_images`);

    try {
      const {committed, snapshot} = await ref.transaction((currentData) => {
        let images = currentData ?? [];

        if (typeof images === "string") {
          try {
            images = JSON.parse(images);
          } catch (e) {
            throw new Error("job_images corrupto en la base de datos");
          }
        }

        if (!Array.isArray(images)) images = [];

        const nextId = getNextId(images);
        const newImage = {id: nextId, url: photoUrl};
        images.push(newImage);
        return images;
      });

      if (!committed) throw new DatabaseError("La actualización de imagen falló");

      const finalImages = snapshot.val();
      return finalImages[finalImages.length - 1];
    } catch (err) {
      if (err instanceof DatabaseError) throw err;
      throw new DatabaseError(err.message || "Error subiendo foto de trabajo");
    }
  }

  /**
   * Elimina una foto por su id dentro de job_images.
   * Retorna un objeto con mensaje de confirmación.
   */
  async deleteJobPhoto(uid, imageId) {
    if (!uid) throw new DataValidationError("UID requerido");

    const id = Number(imageId);
    if (Number.isNaN(id)) throw new DataValidationError("ID de imagen inválido");

    const ref = db.ref(`users/${uid}/job_images`);

    try {
      const {committed} = await ref.transaction((currentData) => {
        let images = currentData ?? [];

        if (typeof images === "string") {
          try {
            images = JSON.parse(images);
          } catch (_) {
            throw new Error("job_images corrupto en la base de datos");
          }
        }

        if (!Array.isArray(images)) images = [];
        return images.filter((i) => i.id !== id);
      });

      if (!committed) throw new DatabaseError("La transacción falló");

      return {message: `Imagen con id ${id} eliminada correctamente.`};
    } catch (err) {
      if (err instanceof DatabaseError) throw err;
      throw new DatabaseError(err.message || "Error eliminando foto de trabajo");
    }
  }

  /**
   * Actualiza la imagen de perfil.
   */
  async updateProfilePic(uid, newImage) {
    if (!uid) throw new DataValidationError("UID requerido");
    if (!newImage || typeof newImage !== "string") throw new DataValidationError("Imagen inválida");

    try {
      await db.ref(`users/${uid}`).update({imageProfile: newImage});
      return {message: "Imagen actualizada correctamente", user: {id: uid, imageProfile: newImage}};
    } catch (err) {
      throw new DatabaseError(err.message || "Error actualizando imagen de perfil");
    }
  }

  /**
   * Actualiza perfil completo de worker (campos relacionados al rol de trabajador).
   */
  async updateProfileWorker(uid, data) {
    if (!uid) throw new DataValidationError("UID requerido");

    const updateProfile = {
      dni: data.dni ?? "",
      userDescription: data.userDescription ?? "",
      imageProfile: data.imageProfile ?? "",
      location: data.location ?? "",
      is_worker: data.is_worker ?? true,
      job_description: data.job_description ?? "",
      job_images: Array.isArray(data.job_images) ? data.job_images : [],
      id_job: data.id_job ?? null,
    };

    try {
      await db.ref(`users/${uid}`).update(updateProfile);
      const snap = await db.ref(`users/${uid}`).get();
      if (!snap.exists()) throw new ResourceNotFoundError("Usuario no encontrado al actualizar worker");
      const profileVal = snap.val();
      return {message: "Perfil actualizado correctamente", user: {id: uid, dni: profileVal?.dni, is_worker: profileVal?.is_worker}};
    } catch (err) {
      if (err instanceof ResourceNotFoundError) throw err;
      throw new DatabaseError(err.message || "Error actualizando perfil de worker");
    }
  }

  /**
   * Retorna todos los trabajadores (array vacío si no hay)
   */
  async getAllWorkers() {
    try {
      const userRef = db.ref("users");
      const results = await userRef.orderByChild("is_worker").equalTo(true).get();

      if (!results.exists()) return {success: true, trabajadores: []};
      return {success: true, trabajadores: Object.values(results.val())};
    } catch (err) {
      throw new DatabaseError(err.message || "Error obteniendo trabajadores");
    }
  }

  /**
   * Busca trabajadores filtrando por nombre e id_job.
   * Devuelve array vacío si no hay coincidencias.
   */
  async searchWorkers(search, id_job) {
    try {
      const snapshot = await db.ref("users").orderByChild("is_worker").equalTo(true).get();
      if (!snapshot.exists()) return {success: true, workers: []};

      let trabajadores = Object.values(snapshot.val());

      if (id_job) {
        const jobId = Number(id_job);
        if (!Number.isNaN(jobId)) trabajadores = trabajadores.filter((t) => t.id_job === jobId);
      }

      if (search) {
        const q = String(search).toLowerCase();
        trabajadores = trabajadores.filter((t) => t.name && t.name.toLowerCase().includes(q));
      }

      return {success: true, workers: trabajadores};
    } catch (err) {
      throw new DatabaseError(err.message || "Error buscando trabajadores");
    }
  }

  /**
   * Obtiene solo las URLs de job_images del usuario.
   */
  async getUserPhotos(uid) {
    if (!uid) throw new DataValidationError("UID requerido");

    try {
      const snapshot = await db.ref(`users/${uid}`).get();
      if (!snapshot.exists()) throw new ResourceNotFoundError("Usuario no encontrado");

      const userData = snapshot.val();
      let imagenes = userData.job_images ?? [];

      if (typeof imagenes === "string") {
        try {
          imagenes = JSON.parse(imagenes);
        } catch (_) {
          throw new DatabaseError("job_images corrupto en la base de datos");
        }
      }

      if (!Array.isArray(imagenes)) imagenes = [];
      return imagenes.map((i) => i.url);
    } catch (err) {
      if (err instanceof ResourceNotFoundError || err instanceof DataValidationError || err instanceof DatabaseError) throw err;
      throw new DatabaseError(err.message || "Error obteniendo fotos de usuario");
    }
  }
}

module.exports = new UserService();
