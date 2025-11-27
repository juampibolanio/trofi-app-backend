/* eslint-disable max-len */
const ReviewsService = require("../services/reviews.service");
const {sendResponse, sendError} = require("../utils/responseHandler");
const {httpStatusCodes} = require("../utils/httpStatusCodes");

/**
 * Crea una nueva reseña.
 */
exports.createReview = async (req, res, next) => {
  try {
    const {reviewed_id, description, score} = req.body;
    const reviewer_id = req.user.uid;

    const review = await ReviewsService.createReview(
        reviewer_id,
        reviewed_id,
        description,
        score,
    );

    return sendResponse(res, httpStatusCodes.created, {
      message: "Reseña creada con éxito",
      review,
    });
  } catch (error) {
    if (error.message.includes("requerido") || error.message.includes("válido") || error.message.includes("no existe") || error.message.includes("No puedes")) {
      return sendError(res, httpStatusCodes.badRequest, error.message);
    }
    next(error);
  }
};

/**
 * Obtiene todas las reseñas recibidas por un usuario específico.
 */
exports.getReviewsByUser = async (req, res, next) => {
  try {
    const {userId} = req.params;

    const reviews = await ReviewsService.getReviewsByUser(userId);

    return sendResponse(res, httpStatusCodes.ok, {
      user_id: userId,
      reviews,
    });
  } catch (error) {
    if (error.message.includes("requerido") || error.message.includes("no encontrado")) {
      return sendError(res, httpStatusCodes.badRequest, error.message);
    }
    next(error);
  }
};

/**
 * Obtiene todas las reseñas hechas por un usuario específico (reviewer).
 */
exports.getReviewsByReviewer = async (req, res, next) => {
  try {
    const {reviewerId} = req.params;

    const reviews = await ReviewsService.getReviewsByReviewer(reviewerId);

    return sendResponse(res, httpStatusCodes.ok, {
      reviewer_id: reviewerId,
      reviews,
    });
  } catch (error) {
    if (error.message.includes("requerido") || error.message.includes("no encontrado")) {
      return sendError(res, httpStatusCodes.badRequest, error.message);
    }
    next(error);
  }
};

/**
 * Obtiene una reseña específica por su ID.
 */
exports.getReviewById = async (req, res, next) => {
  try {
    const {reviewId} = req.params;

    const review = await ReviewsService.getReviewById(reviewId);

    return sendResponse(res, httpStatusCodes.ok, {
      success: true,
      review,
    });
  } catch (error) {
    if (error.message.includes("requerido") || error.message.includes("no encontrada")) {
      return sendError(res, httpStatusCodes.notFound, error.message);
    }
    next(error);
  }
};

/**
 * Actualiza una reseña existente.
 */
exports.updateReview = async (req, res, next) => {
  try {
    const {reviewId} = req.params;
    const {description, score} = req.body;
    const reviewer_id = req.user.uid;

    const review = await ReviewsService.updateReview(
        reviewId,
        reviewer_id,
        description,
        score,
    );

    return sendResponse(res, httpStatusCodes.ok, {
      message: "Reseña actualizada correctamente.",
      review,
    });
  } catch (error) {
    if (error.message.includes("requerido") || error.message.includes("válido") || error.message.includes("permiso") || error.message.includes("no encontrada")) {
      return sendError(res, httpStatusCodes.badRequest, error.message);
    }
    next(error);
  }
};

/**
 * Elimina una reseña existente.
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const {reviewId} = req.params;
    const reviewer_id = req.user.uid;

    const resultado = await ReviewsService.deleteReview(reviewId, reviewer_id);

    return sendResponse(res, httpStatusCodes.ok, {
      success: true,
      ...resultado,
    });
  } catch (error) {
    if (error.message.includes("requerido") || error.message.includes("permiso") || error.message.includes("no encontrada")) {
      return sendError(res, httpStatusCodes.badRequest, error.message);
    }
    next(error);
  }
};