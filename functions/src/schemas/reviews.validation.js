/* eslint-disable max-len */
const Joi = require("joi");

const createReviewSchema = Joi.object({
  reviewed_id: Joi.string().required(),
  description: Joi.string().min(1).required(),
  score: Joi.number().min(1).max(5).required(),
});

const updateReviewSchema = Joi.object({
  description: Joi.string().min(1).optional(),
  score: Joi.number().min(1).max(5).optional(),
}).or("description", "score");

module.exports = {createReviewSchema, updateReviewSchema};