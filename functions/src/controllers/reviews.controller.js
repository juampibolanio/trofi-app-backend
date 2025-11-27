/* eslint-disable camelcase */
/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */
const ReviewsService = require("../services/reviews.service");

/**
 * Crea una nueva reseña
 * POST /reviews
 * Body: { reviewed_id, description, score }
 * Requiere autenticación
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
 * GET /reviews/user/:userId
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
 * GET /reviews/reviewer/:reviewerId
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
 * GET /reviews/:reviewId
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
 * PUT /reviews/:reviewId
 * Body: { description?, score? }
 * Requiere autenticación
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
 * DELETE /reviews/:reviewId
 * Requiere autenticación
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const {reviewId} = req.params;
    const reviewer_id = req.user.uid;

    const resultado = await ReviewsService.deleteReview(reviewId, reviewer_id);

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
 * GET /reviews/user/:userId/average
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
