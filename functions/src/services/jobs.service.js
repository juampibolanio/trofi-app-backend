/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */
const admin = require("../../config/firebase");

const ResourceNotFoundError = require("../errors/ResourceNotFoundError");
const ConflictError = require("../errors/ConflictError");
const DataValidationError = require("../errors/DataValidationError");
const DatabaseError = require("../errors/DatabaseError");

const db = admin.database();

class JobsService {
  /**
   * Obtiene la lista completa de trabajos.
   * @returns {Promise<Array>} Lista de trabajos.
   */
  async getAllJobs() {
    try {
      const snapshot = await db.ref("jobs").get();
      if (!snapshot.exists()) return [];

      const jobs = [];
      snapshot.forEach((child) => {
        jobs.push({id: child.key, ...child.val()});
      });
      return jobs;
    } catch (error) {
      throw new DatabaseError("Error al obtener la lista de trabajos.");
    }
  }

  /**
   * Obtiene un trabajo por ID.
   * @param {*} id
   * @returns
   */
  async getJobById(id) {
    if (!id) throw new DataValidationError("El ID del trabajo es obligatorio.");

    try {
      const snapshot = await db.ref(`jobs/${id}`).get();
      if (!snapshot.exists()) {
        throw new ResourceNotFoundError("Trabajo no encontrado.");
      }

      return {id: snapshot.key, ...snapshot.val()};
    } catch (error) {
      if (error instanceof ResourceNotFoundError) throw error;
      throw new DatabaseError("Error al obtener el trabajo.");
    }
  }

  /**
   * Crea un trabajo nuevo, validando duplicados.
   * @param {*} name
   * @returns
   */
  async createJob(name) {
    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new DataValidationError("El nombre del trabajo es obligatorio.");
    }

    const normalized = name.trim().toLowerCase();

    try {
      // Validación de duplicado
      const snapshot = await db.ref("jobs").get();
      if (snapshot.exists()) {
        let exists = false;

        snapshot.forEach((child) => {
          const childName = (child.val().name || "").toLowerCase().trim();
          if (childName === normalized) {
            exists = true;
            return true;
          }
        });

        if (exists) {
          throw new ConflictError("Este trabajo ya existe.");
        }
      }

      // Crear registro en RTDB
      const newJobRef = db.ref("jobs").push();
      const jobData = {
        name: name.trim(),
        created_at: new Date().toISOString(),
      };

      await newJobRef.set(jobData);

      return {id: newJobRef.key, ...jobData};
    } catch (error) {
      if (error instanceof ConflictError || error instanceof DataValidationError) {
        throw error;
      }
      throw new DatabaseError("Error al crear el trabajo.");
    }
  }

  /**
   * Actualiza el nombre de un trabajo por ID, validando duplicados.
   * @param {*} id
   * @param {*} name
   * @returns
   */
  async updateJob(id, name) {
    if (!id) throw new DataValidationError("El ID del trabajo es obligatorio.");
    if (!name || typeof name !== "string" || name.trim() === "") {
      throw new DataValidationError("El nombre del trabajo es obligatorio.");
    }

    const normalized = name.trim().toLowerCase();

    try {
      const jobSnapshot = await db.ref(`jobs/${id}`).get();
      if (!jobSnapshot.exists()) {
        throw new ResourceNotFoundError("Trabajo no encontrado.");
      }

      // Validar duplicado en otros trabajos
      const snapshot = await db.ref("jobs").get();
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const childId = child.key;
          const childName = (child.val().name || "").toLowerCase().trim();

          if (childName === normalized && childId !== id) {
            throw new ConflictError("Otro trabajo ya tiene este nombre.");
          }
        });
      }

      const updatedJob = {
        ...jobSnapshot.val(),
        name: name.trim(),
        updated_at: new Date().toISOString(),
      };

      await db.ref(`jobs/${id}`).update(updatedJob);

      return {id, ...updatedJob};
    } catch (error) {
      if (
        error instanceof ResourceNotFoundError ||
        error instanceof ConflictError ||
        error instanceof DataValidationError
      ) {
        throw error;
      }
      throw new DatabaseError("Error al actualizar el trabajo.");
    }
  }

  /**
   * Elimina un trabajo por ID, validando que no tenga usuarios asociados.
   * @param {*} id
   * @returns
   */
  async deleteJob(id) {
    if (!id) throw new DataValidationError("El ID del trabajo es obligatorio.");

    try {
      const snapshot = await db.ref(`jobs/${id}`).get();
      if (!snapshot.exists()) {
        throw new ResourceNotFoundError("Trabajo no encontrado.");
      }

      // Verificar usuarios asociados
      const usersSnapshot = await db.ref("users").get();
      if (usersSnapshot.exists()) {
        let linked = false;

        usersSnapshot.forEach((child) => {
          const user = child.val();
          if (user.id_job != null && user.id_job == id) {
            linked = true;
            return true;
          }
        });

        if (linked) {
          throw new ConflictError(
              "No se puede eliminar el trabajo porque tiene usuarios asociados.",
          );
        }
      }

      await db.ref(`jobs/${id}`).remove();

      return {message: "Trabajo eliminado correctamente."};
    } catch (error) {
      if (
        error instanceof ResourceNotFoundError ||
        error instanceof ConflictError ||
        error instanceof DataValidationError
      ) {
        throw error;
      }
      throw new DatabaseError("Error al eliminar el trabajo.");
    }
  }
}

module.exports = new JobsService();
