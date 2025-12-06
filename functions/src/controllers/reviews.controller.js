/* eslint-disable camelcase */
/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */
const ReviewsService = require("../services/reviews.service");
const {syncReview, deleteReviewSync} = require("../services/analytics.service");

/**
 * Crea una nueva reseña
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

    await syncReview({
      id: review.id,
      reviewer: reviewer_id,
      reviewed: reviewed_id,
      score,
      description,
      created_at: new Date(review.created_at).toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: "Reseña creada con éxito",
      data: {review},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene todas las reseñas recibidas por un usuario
 */
exports.getReviewsByUser = async (req, res, next) => {
  try {
    const {userId} = req.params;

    const reviews = await ReviewsService.getReviewsByUser(userId);

    return res.status(200).json({
      success: true,
      data: {
        userId,
        reviews,
        totalReviews: reviews.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene todas las reseñas hechas por un usuario (reviewer)
 */
exports.getReviewsByReviewer = async (req, res, next) => {
  try {
    const {reviewerId} = req.params;

    const reviews = await ReviewsService.getReviewsByReviewer(reviewerId);

    return res.status(200).json({
      success: true,
      data: {
        reviewerId,
        reviews,
        totalReviews: reviews.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene una reseña específica por su ID
 */
exports.getReviewById = async (req, res, next) => {
  try {
    const {reviewId} = req.params;

    const review = await ReviewsService.getReviewById(reviewId);

    return res.status(200).json({
      success: true,
      data: {review},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza una reseña existente
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

    return res.status(200).json({
      success: true,
      message: "Reseña actualizada correctamente",
      data: {review},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina una reseña existente
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const {reviewId} = req.params;
    const reviewer_id = req.user.uid;

    const resultado = await ReviewsService.deleteReview(reviewId, reviewer_id);

    await deleteReviewSync(reviewId);

    return res.status(200).json({
      success: true,
      ...resultado,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene el promedio de puntuación de un usuario
 */
exports.getUserAverageScore = async (req, res, next) => {
  try {
    const {userId} = req.params;

    const averageData = await ReviewsService.getUserAverageScore(userId);

    return res.status(200).json({
      success: true,
      data: {
        userId,
        ...averageData,
      },
    });
  } catch (error) {
    next(error);
  }
};
