/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */
const JobsService = require("../services/jobs.service");
const {sendResponse} = require("../utils/responseHandler");
const BaseError = require("../errors/BaseError");
const DataValidationError = require("../errors/DataValidationError");
const ResourceNotFoundError = require("../errors/ResourceNotFoundError");
const ConflictError = require("../errors/ConflictError");
const DatabaseError = require("../errors/DatabaseError");
const {httpStatusCodes} = require("../utils/httpStatusCodes");
const { syncJob, updateJobSync, deleteJobSync } = require('../services/analytics.service');

/**
 * Obtiene todos los trabajos.
 */
exports.getAllJobs = async (req, res, next) => {
  try {
    const trabajos = await JobsService.getAllJobs();
    return sendResponse(res, httpStatusCodes.ok, trabajos, "Lista de trabajos obtenida correctamente");
  } catch (err) {
    next(err instanceof BaseError ? err : new DatabaseError());
  }
};

/**
 * Obtiene un trabajo por su ID.
 */
exports.getJobById = async (req, res, next) => {
  try {
    const {id} = req.params;
    if (!id) throw new DataValidationError("ID del trabajo requerido");
    const trabajo = await JobsService.getJobById(id);
    return sendResponse(res, httpStatusCodes.ok, trabajo, "Trabajo obtenido correctamente");
  } catch (err) {
    next(
      err instanceof DataValidationError ||
      err instanceof ResourceNotFoundError ||
      err instanceof BaseError ?
        err :
        new DatabaseError(),
    );
  }
};

/**
 * Crea un nuevo trabajo.
 */
exports.createJob = async (req, res, next) => {
  try {
    const {name} = req.body;
    if (!name) throw new DataValidationError("Nombre del trabajo requerido");
    const trabajo = await JobsService.createJob(name);
    
    await syncJob({
      id: trabajo.id,
      name: trabajo.name,
    });

    return sendResponse(res, httpStatusCodes.created, trabajo, "Trabajo creado correctamente");
  } catch (err) {
    next(
      err instanceof DataValidationError ||
      err instanceof ConflictError ||
      err instanceof BaseError ?
        err :
        new DatabaseError(),
    );
  }
};

/**
 * Actualiza un trabajo por ID.
 */
exports.updateJob = async (req, res, next) => {
  try {
    const {id} = req.params;
    const {name} = req.body;
    if (!id) throw new DataValidationError("ID del trabajo requerido");
    if (!name) throw new DataValidationError("Nombre del trabajo requerido");

    const trabajo = await JobsService.updateJob(id, name);
    
    await updateJobSync(id, { name });
    
    return sendResponse(res, httpStatusCodes.ok, trabajo, "Trabajo actualizado correctamente");
  } catch (err) {
    next(
      err instanceof DataValidationError ||
      err instanceof ConflictError ||
      err instanceof ResourceNotFoundError ||
      err instanceof BaseError ?
        err :
        new DatabaseError(),
    );
  }
};

/**
 * Elimina un trabajo por ID.
 */
exports.deleteJob = async (req, res, next) => {
  try {
    const {id} = req.params;
    if (!id) throw new DataValidationError("ID del trabajo requerido");

    const resultado = await JobsService.deleteJob(id);
    
    await deleteJobSync(id);
    
    return sendResponse(res, httpStatusCodes.ok, resultado, "Trabajo eliminado correctamente");
  } catch (err) {
    next(
      err instanceof DataValidationError ||
      err instanceof ConflictError ||
      err instanceof ResourceNotFoundError ||
      err instanceof BaseError ?
        err :
        new DatabaseError(),
    );
  }
};
