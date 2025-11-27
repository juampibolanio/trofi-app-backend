const Joi = require("joi");

const message = Joi.object({
  senderId: Joi.string().required(),
  content: Joi.string().max(500).required(),
  chatId: Joi.string().required(),
});

module.exports = {message};
