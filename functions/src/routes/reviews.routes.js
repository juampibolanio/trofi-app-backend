/* eslint-disable max-len */
/* eslint-disable new-cap */
const express = require("express");
const router = express.Router();

const ReviewsController = require("../controllers/reviews.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {createReviewSchema, updateReviewSchema} = require("../schemas/reviews.validation");

// RUTAS PÚBLICAS 

// Obtener reseñas recibidas por un usuario
router.get("/user/:userId", ReviewsController.getReviewsByUser);

// Obtener reseñas hechas por un usuario (reviewer)
router.get("/reviewer/:reviewerId", ReviewsController.getReviewsByReviewer);

// Obtener una reseña específica
router.get("/:reviewId", ReviewsController.getReviewById);

// Obtener promedio de puntuación de un usuario
router.get("/user/:userId/average", ReviewsController.getUserAverageScore);

// RUTAS PROTEGIDAS

// Crear nueva reseña
router.post(
    "/",
    authMiddleware,
    validate(createReviewSchema),
    ReviewsController.createReview,
);

// Actualizar reseña
router.put(
    "/:reviewId",
    authMiddleware,
    validate(updateReviewSchema),
    ReviewsController.updateReview,
);

// Eliminar reseña
router.delete(
    "/:reviewId",
    authMiddleware,
    ReviewsController.deleteReview,
);

module.exports = router;
