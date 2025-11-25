const Joi = require("joi");


const userWork = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phoneNumber: Joi.string().pattern(/^[0-9]{6,15}$/).required(),
  userDescription: Joi.string().min(0).required(),
  imageProfile: Joi.string().min(0).required(),
  dni: Joi.string().pattern(/^[0-9]{0,8}$/).required(),
  location: Joi.string().min(0).required(),
  is_worker: Joi.boolean().required(),
  id_job: Joi.number().integer().min(1).required(),
  job_description: Joi.string().min(1).required(),
  job_images: Joi.array().items(Joi.string()),
  crated_at: Joi.date().required(),
});

const updateNameSchema = Joi.object({
  uid: Joi.string().required(),
  name: Joi.string().min(2).max(100).required(),
});

const updateUserDescriptionSchema = Joi.object({
  uid: Joi.string().required(),
  userDescription: Joi.string().min(3).max(500).required(),
});

const updateJobDescriptionSchema = Joi.object({
  uid: Joi.string().required(),
  job_description: Joi.string().min(3).max(500).required(),
});

const updateLocationSchema = Joi.object({
  uid: Joi.string().required(),
  location: Joi.string().min(3).max(200).required(),
});

const updatePhoneSchema = Joi.object({
  uid: Joi.string().required(),
  phone: Joi.string().min(5).max(20).required(),
});

module.exports = {
  userWork,
  updateNameSchema,
  updateJobDescriptionSchema,
  updateUserDescriptionSchema,
  updateLocationSchema,
  updatePhoneSchema,
};
