const Joi = require("joi");

const chat = Joi.object({
  participants: Joi.array().items(Joi.string().required()).required(),
  initialMessage: Joi.string().max(500).optional().allow(null, ""),
});

module.exports = {chat};
