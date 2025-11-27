/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */
const admin = require("../../config/firebase");
const db = admin.database();

const DataValidationError = require("../errors/DataValidationError");
const ResourceNotFoundError = require("../errors/ResourceNotFoundError");
const DatabaseError = require("../errors/DatabaseError");
const AuthorizationError = require("../errors/AuthorizationError");
const ConflictError = require("../errors/ConflictError");

class ReviewsService {
  /**
   * Crea una nueva reseña.
   * @param {string} reviewerId - UID del usuario que crea la reseña
   * @param {string} reviewedId - UID del usuario reseñado
   * @param {string} description - Descripción de la reseña
   * @param {number} score - Puntuación (1-5)
   * @return {object} Reseña creada
   */
  async createReview(reviewerId, reviewedId, description, score) {
    if (!reviewerId) {
      throw new DataValidationError("El ID del reviewer es requerido");
    }

    if (!reviewedId) {
      throw new DataValidationError("El ID del usuario a reseñar es requerido");
    }

    if (!description || typeof description !== "string" || description.trim() === "") {
      throw new DataValidationError("La descripción es requerida y debe ser un texto válido");
    }

    if (!score || typeof score !== "number" || score < 1 || score > 5) {
      throw new DataValidationError("El score debe ser un número entre 1 y 5");
    }

    try {
      // Verificar que el usuario a reseñar existe
      const reviewedSnapshot = await db.ref(`users/${reviewedId}`).once("value");
      if (!reviewedSnapshot.exists()) {
        throw new ResourceNotFoundError("El usuario a reseñar no existe");
      }

      // Verificar que no sea una auto-reseña
      if (reviewerId === reviewedId) {
        throw new ConflictError("No puedes reseñarte a ti mismo");
      }

      // Verificar si ya existe una reseña de este reviewer a este usuario
      const existingReviewSnapshot = await db.ref("reviews")
          .orderByChild("reviewer_id")
          .equalTo(reviewerId)
          .once("value");

      if (existingReviewSnapshot.exists()) {
        const reviews = existingReviewSnapshot.val();
        const alreadyReviewed = Object.values(reviews).some(
            (review) => review.reviewed_id === reviewedId,
        );

        if (alreadyReviewed) {
          throw new ConflictError("Ya has reseñado a este usuario anteriormente");
        }
      }

      // Crear la nueva reseña
      const newReviewRef = db.ref("reviews").push();
      const reviewId = newReviewRef.key;

      const newReview = {
        reviewer_id: reviewerId,
        reviewed_id: reviewedId,
        description: description.trim(),
        score,
        created_at: new Date().toISOString(),
      };

      await newReviewRef.set(newReview);

      return {
        id: reviewId,
        ...newReview,
      };
    } catch (err) {
      if (
        err instanceof DataValidationError ||
        err instanceof ResourceNotFoundError ||
        err instanceof ConflictError
      ) {
        throw err;
      }
      throw new DatabaseError(err.message || "Error al crear la reseña");
    }
  }

  /**
   * Obtiene todas las reseñas recibidas por un usuario específico.
   * @param {string} userId - UID del usuario
   * @return {Array} Lista de reseñas con datos del reviewer
   */
  async getReviewsByUser(userId) {
    if (!userId) {
      throw new DataValidationError("El ID del usuario es requerido");
    }

    try {
      // Verificar que el usuario existe
      const userSnapshot = await db.ref(`users/${userId}`).once("value");
      if (!userSnapshot.exists()) {
        throw new ResourceNotFoundError("Usuario no encontrado");
      }

      const snapshot = await db.ref("reviews")
          .orderByChild("reviewed_id")
          .equalTo(userId)
          .once("value");

      if (!snapshot.exists()) {
        return [];
      }

      const reviews = [];
      snapshot.forEach((childSnapshot) => {
        reviews.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });

      // Enriquecer con datos del reviewer
      const enrichedReviews = await Promise.all(
          reviews.map(async (review) => {
            const reviewerSnapshot = await db.ref(`users/${review.reviewer_id}`).once("value");
            const reviewer = reviewerSnapshot.exists() ? reviewerSnapshot.val() : null;

            return {
              ...review,
              reviewer: reviewer ? {
                uid: review.reviewer_id,
                name: reviewer.name || "",
                email: reviewer.email || "",
                imageProfile: reviewer.imageProfile || "",
              } : null,
            };
          }),
      );

      // Ordenar por fecha más reciente
      enrichedReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return enrichedReviews;
    } catch (err) {
      if (err instanceof DataValidationError || err instanceof ResourceNotFoundError) {
        throw err;
      }
      throw new DatabaseError(err.message || "Error al obtener reseñas del usuario");
    }
  }

  /**
   * Obtiene todas las reseñas hechas por un usuario específico (reviewer).
   * @param {string} reviewerId - UID del reviewer
   * @return {Array} Lista de reseñas con datos del usuario reseñado
   */
  async getReviewsByReviewer(reviewerId) {
    if (!reviewerId) {
      throw new DataValidationError("El ID del reviewer es requerido");
    }

    try {
      // Verificar que el usuario existe
      const userSnapshot = await db.ref(`users/${reviewerId}`).once("value");
      if (!userSnapshot.exists()) {
        throw new ResourceNotFoundError("Usuario no encontrado");
      }

      const snapshot = await db.ref("reviews")
          .orderByChild("reviewer_id")
          .equalTo(reviewerId)
          .once("value");

      if (!snapshot.exists()) {
        return [];
      }

      const reviews = [];
      snapshot.forEach((childSnapshot) => {
        reviews.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });

      // Enriquecer con datos del usuario reseñado
      const enrichedReviews = await Promise.all(
          reviews.map(async (review) => {
            const reviewedSnapshot = await db.ref(`users/${review.reviewed_id}`).once("value");
            const reviewed = reviewedSnapshot.exists() ? reviewedSnapshot.val() : null;

            return {
              ...review,
              reviewed: reviewed ? {
                uid: review.reviewed_id,
                name: reviewed.name || "",
                email: reviewed.email || "",
                imageProfile: reviewed.imageProfile || "",
              } : null,
            };
          }),
      );

      // Ordenar por fecha más reciente
      enrichedReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return enrichedReviews;
    } catch (err) {
      if (err instanceof DataValidationError || err instanceof ResourceNotFoundError) {
        throw err;
      }
      throw new DatabaseError(err.message || "Error al obtener reseñas del reviewer");
    }
  }

  /**
   * Obtiene una reseña específica por su ID.
   * @param {string} reviewId - ID de la reseña
   * @return {object} Reseña con datos del reviewer
   */
  async getReviewById(reviewId) {
    if (!reviewId) {
      throw new DataValidationError("El ID de la reseña es requerido");
    }

    try {
      const snapshot = await db.ref(`reviews/${reviewId}`).once("value");

      if (!snapshot.exists()) {
        throw new ResourceNotFoundError("Reseña no encontrada");
      }

      const review = {
        id: snapshot.key,
        ...snapshot.val(),
      };

      // Enriquecer con datos del reviewer
      const reviewerSnapshot = await db.ref(`users/${review.reviewer_id}`).once("value");
      const reviewer = reviewerSnapshot.exists() ? reviewerSnapshot.val() : null;

      return {
        ...review,
        reviewer: reviewer ? {
          uid: review.reviewer_id,
          name: reviewer.name || "",
          email: reviewer.email || "",
          imageProfile: reviewer.imageProfile || "",
        } : null,
      };
    } catch (err) {
      if (err instanceof DataValidationError || err instanceof ResourceNotFoundError) {
        throw err;
      }
      throw new DatabaseError(err.message || "Error al obtener la reseña");
    }
  }

  /**
   * Actualiza una reseña existente.
   * @param {string} reviewId - ID de la reseña
   * @param {string} reviewerId - UID del reviewer (para verificación)
   * @param {string} description - Nueva descripción (opcional)
   * @param {number} score - Nuevo score (opcional)
   * @return {object} Reseña actualizada
   */
  async updateReview(reviewId, reviewerId, description, score) {
    if (!reviewId) {
      throw new DataValidationError("El ID de la reseña es requerido");
    }

    if (description && (typeof description !== "string" || description.trim() === "")) {
      throw new DataValidationError("La descripción debe ser un texto válido");
    }

    if (score && (typeof score !== "number" || score < 1 || score > 5)) {
      throw new DataValidationError("El score debe ser un número entre 1 y 5");
    }

    try {
      // Verificar que la reseña existe
      const reviewSnapshot = await db.ref(`reviews/${reviewId}`).once("value");
      if (!reviewSnapshot.exists()) {
        throw new ResourceNotFoundError("Reseña no encontrada");
      }

      const review = reviewSnapshot.val();

      // Verificar que el usuario autenticado es el reviewer
      if (review.reviewer_id !== reviewerId) {
        throw new AuthorizationError("No tienes permiso para actualizar esta reseña");
      }

      const updatedFields = {
        updated_at: new Date().toISOString(),
      };

      if (description) {
        updatedFields.description = description.trim();
      }

      if (score) {
        updatedFields.score = score;
      }

      await db.ref(`reviews/${reviewId}`).update(updatedFields);

      return {
        id: reviewId,
        ...review,
        ...updatedFields,
      };
    } catch (err) {
      if (
        err instanceof DataValidationError ||
        err instanceof ResourceNotFoundError ||
        err instanceof AuthorizationError
      ) {
        throw err;
      }
      throw new DatabaseError(err.message || "Error al actualizar la reseña");
    }
  }

  /**
   * Elimina una reseña existente.
   * @param {string} reviewId - ID de la reseña
   * @param {string} reviewerId - UID del reviewer (para verificación)
   * @return {object} Confirmación
   */
  async deleteReview(reviewId, reviewerId) {
    if (!reviewId) {
      throw new DataValidationError("El ID de la reseña es requerido");
    }

    try {
      // Verificar que la reseña existe
      const reviewSnapshot = await db.ref(`reviews/${reviewId}`).once("value");
      if (!reviewSnapshot.exists()) {
        throw new ResourceNotFoundError("Reseña no encontrada");
      }

      const review = reviewSnapshot.val();

      // Verificar que el usuario autenticado es el reviewer
      if (review.reviewer_id !== reviewerId) {
        throw new AuthorizationError("No tienes permiso para eliminar esta reseña");
      }

      await db.ref(`reviews/${reviewId}`).remove();

      return {message: "Reseña eliminada correctamente"};
    } catch (err) {
      if (
        err instanceof DataValidationError ||
        err instanceof ResourceNotFoundError ||
        err instanceof AuthorizationError
      ) {
        throw err;
      }
      throw new DatabaseError(err.message || "Error al eliminar la reseña");
    }
  }

  /**
   * Calcula el promedio de puntuación de un usuario
   * @param {string} userId - UID del usuario
   * @return {object} Promedio y cantidad de reseñas
   */
  async getUserAverageScore(userId) {
    if (!userId) {
      throw new DataValidationError("El ID del usuario es requerido");
    }

    try {
      const reviews = await this.getReviewsByUser(userId);

      if (reviews.length === 0) {
        return {
          averageScore: 0,
          totalReviews: 0,
        };
      }

      const totalScore = reviews.reduce((sum, review) => sum + review.score, 0);
      const averageScore = totalScore / reviews.length;

      return {
        averageScore: parseFloat(averageScore.toFixed(2)),
        totalReviews: reviews.length,
      };
    } catch (err) {
      if (err instanceof DataValidationError) throw err;
      throw new DatabaseError(err.message || "Error al calcular promedio");
    }
  }
}

module.exports = new ReviewsService();
