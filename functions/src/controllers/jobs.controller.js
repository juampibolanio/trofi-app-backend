const JobsService = require("../services/jobs.service");
const {sendResponse, sendError} = require("../utils/responseHandler");
const {httpStatusCodes} = require("../utils/httpStatusCodes");

// --------- OBTENER TODOS LOS TRABAJOS -------
exports.getAllJobs = async (req, res, next) => {
  try {
    const trabajos = await JobsService.getAllJobs();

    return sendResponse(res, httpStatusCodes.ok, {
      success: true,
      trabajos,
    });
  } catch (error) {
    next(error);
  }
};

// ---------OBTENER UN TRABAJO POR ID--------
exports.getJobById = async (req, res, next) => {
  try {
    const {id} = req.params;
    const trabajo = await JobsService.getJobById(id);

    return sendResponse(res, httpStatusCodes.ok, {
      success: true,
      trabajo,
    });
  } catch (error) {
    if (error.message.includes("requerido") || error.message.includes("no encontrado")) {
      return sendError(res, httpStatusCodes.badRequest, error.message);
    }
    next(error);
  }
};

// ------- CREAR UN NUEVO TRABAJO -------------
exports.createJob = async (req, res, next) => {
  try {
    const {name} = req.body;
    const trabajo = await JobsService.createJob(name);

    return sendResponse(res, httpStatusCodes.created, {
      success: true,
      message: "Trabajo creado correctamente.",
      trabajo,
    });
  } catch (error) {
    if (error.message.includes("requerido") || error.message.includes("ya existe")) {
      return sendError(res, httpStatusCodes.badRequest, error.message);
    }
    next(error);
  }
};

// -------- ACTUALIZAR UN TRABAJO -------------
exports.updateJob = async (req, res, next) => {
  try {
    const {id} = req.params;
    const {name} = req.body;
    const trabajo = await JobsService.updateJob(id, name);

    return sendResponse(res, httpStatusCodes.ok, {
      success: true,
      message: "Trabajo actualizado correctamente.",
      trabajo,
    });
  } catch (error) {
    if (error.message.includes("requerido") || error.message.includes("no encontrado") || error.message.includes("ya existe")) {
      return sendError(res, httpStatusCodes.badRequest, error.message);
    }
    next(error);
  }
};

// ---------- ELIMINAR UN TRABAJO --------------
exports.deleteJob = async (req, res, next) => {
  try {
    const {id} = req.params;
    const resultado = await JobsService.deleteJob(id);

    return sendResponse(res, httpStatusCodes.ok, {
      success: true,
      ...resultado,
    });
  } catch (error) {
    if (error.message.includes("requerido") || error.message.includes("no encontrado") || error.message.includes("usuarios asociados")) {
      return sendError(res, httpStatusCodes.badRequest, error.message);
    }
    next(error);
  }
};