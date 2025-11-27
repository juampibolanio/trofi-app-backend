const admin = require("../../config/firebase");

const db = admin.database();

class ReviewsService {
  /**
   * Crea una nueva reseña.
   */
  async createReview(reviewerId, reviewedId, description, score) {
    if (!reviewerId) {
      throw new Error("El ID del reviewer es requerido.");
    }

    if (!reviewedId) {
      throw new Error("El ID del usuario a reseñar es requerido.");
    }

    if (!description || typeof description !== "string" || description.trim() === "") {
      throw new Error("La descripción es requerida y debe ser un texto válido.");
    }

    if (!score || typeof score !== "number" || score < 1 || score > 5) {
      throw new Error("El score debe ser un número entre 1 y 5.");
    }

    // Verificar que el usuario a reseñar existe
    const reviewedSnapshot = await db.ref(`users/${reviewedId}`).get();
    if (!reviewedSnapshot.exists()) {
      throw new Error("El usuario a reseñar no existe.");
    }

    // Verificar que no sea una auto-reseña
    if (reviewerId === reviewedId) {
      throw new Error("No puedes reseñarte a ti mismo.");
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
  }

  /**
   * Obtiene todas las reseñas recibidas por un usuario específico.
   */
  async getReviewsByUser(userId) {
    if (!userId) {
      throw new Error("El ID del usuario es requerido.");
    }

    // Verificar que el usuario existe
    const userSnapshot = await db.ref(`users/${userId}`).get();
    if (!userSnapshot.exists()) {
      throw new Error("Usuario no encontrado.");
    }

    const snapshot = await db.ref("reviews").orderByChild("reviewed_id")
        .equalTo(userId).get();

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
          const reviewerSnapshot = await db.ref(`users/${review.reviewer_id}`).get();
          const reviewer = reviewerSnapshot.exists() ? reviewerSnapshot.val() : null;

          return {
            ...review,
            reviewer: reviewer ? {
              id: review.reviewer_id,
              name: reviewer.name || "",
              email: reviewer.email || "",
              imageProfile: reviewer.imageProfile || "",
            } : null,
          };
        }),
    );

    return enrichedReviews;
  }

  /**
   * Obtiene todas las reseñas hechas por un usuario específico (reviewer).
   */
  async getReviewsByReviewer(reviewerId) {
    if (!reviewerId) {
      throw new Error("El ID del reviewer es requerido.");
    }

    // Verificar que el usuario existe
    const userSnapshot = await db.ref(`users/${reviewerId}`).get();
    if (!userSnapshot.exists()) {
      throw new Error("Usuario no encontrado.");
    }

    const snapshot = await db.ref("reviews").orderByChild("reviewer_id")
        .equalTo(reviewerId).get();

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
          const reviewedSnapshot = await db.ref(`users/${review.reviewed_id}`).get();
          const reviewed = reviewedSnapshot.exists() ? reviewedSnapshot.val() : null;

          return {
            ...review,
            reviewed: reviewed ? {
              id: review.reviewed_id,
              name: reviewed.name || "",
              email: reviewed.email || "",
              imageProfile: reviewed.imageProfile || "",
            } : null,
          };
        }),
    );

    return enrichedReviews;
  }

  /**
   * Obtiene una reseña específica por su ID.
   */
  async getReviewById(reviewId) {
    if (!reviewId) {
      throw new Error("El ID de la reseña es requerido.");
    }

    const snapshot = await db.ref(`reviews/${reviewId}`).get();

    if (!snapshot.exists()) {
      throw new Error("Reseña no encontrada.");
    }

    const review = {
      id: snapshot.key,
      ...snapshot.val(),
    };

    // Enriquecer con datos del reviewer
    const reviewerSnapshot = await db.ref(`users/${review.reviewer_id}`).get();
    const reviewer = reviewerSnapshot.exists() ? reviewerSnapshot.val() : null;

    return {
      ...review,
      reviewer: reviewer ? {
        id: review.reviewer_id,
        name: reviewer.name || "",
        email: reviewer.email || "",
        imageProfile: reviewer.imageProfile || "",
      } : null,
    };
  }

  /**
   * Actualiza una reseña existente.
   */
  async updateReview(reviewId, reviewerId, description, score) {
    if (!reviewId) {
      throw new Error("El ID de la reseña es requerido.");
    }

    // Verificar que la reseña existe
    const reviewSnapshot = await db.ref(`reviews/${reviewId}`).get();
    if (!reviewSnapshot.exists()) {
      throw new Error("Reseña no encontrada.");
    }

    const review = reviewSnapshot.val();

    // Verificar que el usuario autenticado es el reviewer
    if (review.reviewer_id !== reviewerId) {
      throw new Error("No tienes permiso para actualizar esta reseña.");
    }

    if (description && (typeof description !== "string" || description.trim() === "")) {
      throw new Error("La descripción debe ser un texto válido.");
    }

    if (score && (typeof score !== "number" || score < 1 || score > 5)) {
      throw new Error("El score debe ser un número entre 1 y 5.");
    }

    const updatedReview = {
      ...review,
      description: description ? description.trim() : review.description,
      score: score || review.score,
      updated_at: new Date().toISOString(),
    };

    await db.ref(`reviews/${reviewId}`).update(updatedReview);

    return {
      id: reviewId,
      ...updatedReview,
    };
  }

  /**
   * Elimina una reseña existente.
   */
  async deleteReview(reviewId, reviewerId) {
    if (!reviewId) {
      throw new Error("El ID de la reseña es requerido.");
    }

    // Verificar que la reseña existe
    const reviewSnapshot = await db.ref(`reviews/${reviewId}`).get();
    if (!reviewSnapshot.exists()) {
      throw new Error("Reseña no encontrada.");
    }

    const review = reviewSnapshot.val();

    // Verificar que el usuario autenticado es el reviewer
    if (review.reviewer_id !== reviewerId) {
      throw new Error("No tienes permiso para eliminar esta reseña.");
    }

    await db.ref(`reviews/${reviewId}`).remove();

    return {message: "Reseña eliminada correctamente."};
  }
}

module.exports = new ReviewsService();