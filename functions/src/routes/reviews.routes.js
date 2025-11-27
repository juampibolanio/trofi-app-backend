/* eslint-disable max-len */
const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const ReviewsController = require("../controllers/reviews.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const {createReviewSchema, updateReviewSchema} = require("../schemas/reviews.validation");

// PUBLICOS
router.get("/user-reviews/:userId", ReviewsController.getReviewsByUser);
router.get("/reviewer-reviews/:reviewerId", ReviewsController.getReviewsByReviewer);
router.get("/reviews/:reviewId", ReviewsController.getReviewById);

// PROTEGIDOS (Requieren auth)
router.post("/reviews", authMiddleware, validate(createReviewSchema), ReviewsController.createReview);
router.put("/reviews/:reviewId", authMiddleware, validate(updateReviewSchema), ReviewsController.updateReview);
router.delete("/reviews/:reviewId", authMiddleware, ReviewsController.deleteReview);

module.exports = router;