const admin = require("../../config/firebase");

const db = admin.database();

class JobsService {
  // OBTENER TODOS LOS TRABAJOS 
  async getAllJobs() {
    const snapshot = await db.ref("trabajos").get();

    if (!snapshot.exists()) {
      return [];
    }

    const trabajos = [];
    snapshot.forEach((childSnapshot) => {
      trabajos.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });

    return trabajos;
  }

  // OBTENER UN TRABAJO POR ID 
  async getJobById(id) {
    if (!id) {
      throw new Error("El ID del trabajo es requerido.");
    }

    const snapshot = await db.ref(`trabajos/${id}`).get();

    if (!snapshot.exists()) {
      throw new Error("Trabajo no encontrado.");
    }

    return {
      id: snapshot.key,
      ...snapshot.val(),
    };
  }

  //CREAR UN NUEVO TRABAJO
  async createJob(name) {
    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new Error("El nombre del trabajo es requerido y debe ser un texto válido.");
    }

    // Verificar si el trabajo ya existe
    const snapshot = await db.ref("trabajos").orderByChild("name")
        .equalTo(name.trim()).get();

    if (snapshot.exists()) {
      throw new Error("Este trabajo ya existe.");
    }

    // Generar un nuevo ID
    const newJobRef = db.ref("trabajos").push();
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
    const jobSnapshot = await db.ref(`trabajos/${id}`).get();

    if (!jobSnapshot.exists()) {
      throw new Error("Trabajo no encontrado.");
    }

    // Verificar si otro trabajo tiene el mismo nombre
    const snapshot = await db.ref("trabajos").orderByChild("name")
        .equalTo(name.trim()).get();

    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        if (childSnapshot.key !== id) {
          throw new Error("Ya existe otro trabajo con este nombre.");
        }
      });
    }

    const updatedJob = {
      ...jobSnapshot.val(),
      name: name.trim(),
      updated_at: new Date().toISOString(),
    };

    await db.ref(`trabajos/${id}`).update(updatedJob);

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
    const jobSnapshot = await db.ref(`trabajos/${id}`).get();

    if (!jobSnapshot.exists()) {
      throw new Error("Trabajo no encontrado.");
    }

    // Verificar si hay usuarios asociados a este trabajo
    const usersSnapshot = await db.ref("users").orderByChild("id_job")
        .equalTo(id).get();

    if (usersSnapshot.exists()) {
      throw new Error("No se puede eliminar este trabajo porque hay usuarios asociados.");
    }

    await db.ref(`trabajos/${id}`).remove();

    return {message: "Trabajo eliminado correctamente."};
  }
}

module.exports = new JobsService();