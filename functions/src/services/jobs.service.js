/* eslint-disable max-len */
const admin = require("../../config/firebase");

const db = admin.database();

class JobsService {
  // OBTENER TODOS LOS TRABAJOS
  async getAllJobs() {
    const snapshot = await db.ref("jobs").get();

    if (!snapshot.exists()) {
      return [];
    }

    const jobs = [];
    snapshot.forEach((childSnapshot) => {
      jobs.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });

    return jobs;
  }

  // OBTENER UN TRABAJO POR ID
  async getJobById(id) {
    if (!id) {
      throw new Error("El ID del trabajo es requerido.");
    }

    const snapshot = await db.ref(`jobs/${id}`).get();

    if (!snapshot.exists()) {
      throw new Error("Trabajo no encontrado.");
    }

    return {
      id: snapshot.key,
      ...snapshot.val(),
    };
  }

  // CREAR UN NUEVO TRABAJO
  async createJob(name) {
    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new Error("El nombre del trabajo es requerido y debe ser un texto válido.");
    }

    const normalized = name.trim().toLowerCase();

    // Verificar si el trabajo ya existe (case-insensitive)
    const snapshot = await db.ref("jobs").get();
    if (snapshot.exists()) {
      let exists = false;
      snapshot.forEach((child) => {
        const childName = (child.val().name || "").toString().trim().toLowerCase();
        if (childName === normalized) {
          exists = true;
          return true;
        }
      });
      if (exists) {
        throw new Error("Este trabajo ya existe.");
      }
    }

    // Generar un nuevo ID
    const newJobRef = db.ref("jobs").push();
    const jobId = newJobRef.key;

    const newJob = {
      name: name.trim(),
      created_at: new Date().toISOString(),
    };

    await newJobRef.set(newJob);

    return {
      id: jobId,
      ...newJob,
    };
  }

  // ACTUALIZAR UN TRABAJO
  async updateJob(id, name) {
    if (!id) {
      throw new Error("El ID del trabajo es requerido.");
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new Error("El nombre del trabajo es requerido y debe ser un texto válido.");
    }

    // Verificar que el trabajo existe
    const jobSnapshot = await db.ref(`jobs/${id}`).get();

    if (!jobSnapshot.exists()) {
      throw new Error("Trabajo no encontrado.");
    }

    const normalized = name.trim().toLowerCase();

    // Verificar si otro trabajo tiene el mismo nombre
    const allSnapshot = await db.ref("jobs").get();
    if (allSnapshot.exists()) {
      allSnapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const childName = (childSnapshot.val().name || "").toString().trim().toLowerCase();
        if (childName === normalized && key !== id) {
          throw new Error("Ya existe otro trabajo con este nombre.");
        }
      });
    }

    const updatedJob = {
      ...jobSnapshot.val(),
      name: name.trim(),
      updated_at: new Date().toISOString(),
    };

    await db.ref(`jobs/${id}`).update(updatedJob);

    return {
      id,
      ...updatedJob,
    };
  }

  //  ELIMINAR UN TRABAJO
  async deleteJob(id) {
    if (!id) {
      throw new Error("El ID del trabajo es requerido.");
    }

    // Verificar que el trabajo existe
    const jobSnapshot = await db.ref(`jobs/${id}`).get();

    if (!jobSnapshot.exists()) {
      throw new Error("Trabajo no encontrado.");
    }

    // Verificar si hay usuarios asociados a este trabajo
    const usersSnapshot = await db.ref("users").get();

    if (usersSnapshot.exists()) {
      let hasAssociatedUsers = false;

      usersSnapshot.forEach((child) => {
        const user = child.val() || {};
        // comprobar tanto string como number (coerción intencional)
        if (user.id_job !== undefined && user.id_job !== null) {
          // usamos igualdad no estricta para cubrir "1" == 1
          if (user.id_job == id) {
            hasAssociatedUsers = true;
            return true;
          }
        }
      });

      if (hasAssociatedUsers) {
        throw new Error("No se puede eliminar este trabajo porque hay usuarios asociados.");
      }
    }

    await db.ref(`jobs/${id}`).remove();

    return {message: "Trabajo eliminado correctamente."};
  }
}

module.exports = new JobsService();
