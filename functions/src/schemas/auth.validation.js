/* eslint-disable max-len */
const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.string().pattern(/^[0-9]{6,15}$/).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});


const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  oobCode: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

module.exports = {registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema};
