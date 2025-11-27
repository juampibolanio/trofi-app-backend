const Joi = require("joi");

const createJobSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
});

const updateJobSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
});

module.exports = {createJobSchema, updateJobSchema};
