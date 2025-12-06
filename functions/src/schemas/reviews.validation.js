/* eslint-disable max-len */
const Joi = require("joi");

const createReviewSchema = Joi.object({
  reviewed_id: Joi.string().required().messages({
    "string.empty": "El ID del usuario a reseñar es requerido",
    "any.required": "El ID del usuario a reseñar es requerido",
  }),
  description: Joi.string().min(10).max(500).required().messages({
    "string.empty": "La descripción es requerida",
    "string.min": "La descripción debe tener al menos 10 caracteres",
    "string.max": "La descripción no puede exceder 500 caracteres",
    "any.required": "La descripción es requerida",
  }),
  score: Joi.number().min(1).max(5).required().custom((value, helpers) => {
    if ((value * 2) % 1 !== 0) {
      return helpers.error("number.half");
    }
    return value;
  }).messages({
    "number.base": "El score debe ser un número",
    "number.min": "El score debe ser al menos 1",
    "number.max": "El score no puede ser mayor a 5",
    "number.half": "El score debe ser en incrementos de 0.5 (ej: 1, 1.5, 2, 2.5, etc.)",
    "any.required": "El score es requerido",
  }),
});

const updateReviewSchema = Joi.object({
  description: Joi.string().min(10).max(500).optional().messages({
    "string.min": "La descripción debe tener al menos 10 caracteres",
    "string.max": "La descripción no puede exceder 500 caracteres",
  }),
  score: Joi.number().min(1).max(5).optional().custom((value, helpers) => {
    if ((value * 2) % 1 !== 0) {
      return helpers.error("number.half");
    }
    return value;
  }).messages({
    "number.base": "El score debe ser un número",
    "number.min": "El score debe ser al menos 1",
    "number.max": "El score no puede ser mayor a 5",
    "number.half": "El score debe ser en incrementos de 0.5 (ej: 1, 1.5, 2, 2.5, etc.)",
  }),
}).or("description", "score").messages({
  "object.missing": "Debes proporcionar al menos description o score para actualizar",
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
};
