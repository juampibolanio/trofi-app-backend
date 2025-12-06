/* eslint-disable valid-jsdoc */
/* eslint-disable camelcase */
/* eslint-disable max-len */
const UserService = require("../services/user.service");
const {sendResponse} = require("../utils/responseHandler");
const {httpStatusCodes} = require("../utils/httpStatusCodes");
const {updateUserSync, syncUser} = require("../services/analytics.service");

/* ========================= REGISTRO ========================= */

exports.registerWorker = async (req, res, next) => {
  try {
    const newWorker = await UserService.createUserWork(req.body);

    await syncUser({
      uid: newWorker.uid,
      name: newWorker.name,
      email: newWorker.email,
      is_worker: true,
      created_at: new Date().toISOString(),
      job: newWorker.id_job,
    });

    return sendResponse(res, httpStatusCodes.created, {
      message: "Trabajador registrado exitosamente",
      trabajador: newWorker,
    });
  } catch (err) {
    next(err);
  }
};

/* ======================== OBTENER PERFILES ======================== */

exports.getProfileByEmail = async (req, res, next) => {
  try {
    const profile = await UserService.getUserProfileByEmail(req.params.email);
    return sendResponse(res, httpStatusCodes.ok, profile);
  } catch (err) {
    next(err);
  }
};

exports.getProfileByUid = async (req, res, next) => {
  try {
    const profile = await UserService.getUserProfileByUid(req.params.uid);
    return sendResponse(res, httpStatusCodes.ok, profile);
  } catch (err) {
    next(err);
  }
};

/**
 * Devuelve el perfil del usuario autenticado
 */
exports.getMe = async (req, res, next) => {
  try {
    const uid = req.user?.uid;
    const profile = await UserService.getUserProfileByUid(uid);
    return sendResponse(res, httpStatusCodes.ok, {uid, profile});
  } catch (err) {
    next(err);
  }
};

/* ====================== ACTUALIZACIÓN DE PERFIL ====================== */

exports.updateProfile = async (req, res, next) => {
  try {
    const updated = await UserService.updateProfileByUid(req.params.uid, req.body);

    await updateUserSync(req.params.uid, {
      name: updated.name,
      email: updated.email,
      is_worker: updated.is_worker || false,
      created_at: updated.created_at,
      job: updated.id_job || null,
    });

    return sendResponse(res, httpStatusCodes.ok, {
      message: "Perfil actualizado",
      perfil: updated,
    });
  } catch (err) {
    next(err);
  }
};

/* ------- Actualizaciones simples ------- */

exports.updateName = async (req, res, next) => {
  try {
    const updated = await UserService.updateProfileByUid(req.params.uid, {name: req.body.name});
    return sendResponse(res, httpStatusCodes.ok, {
      message: "Nombre actualizado",
      updated,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUserDescription = async (req, res, next) => {
  try {
    const updated = await UserService.updateProfileByUid(req.params.uid, {
      userDescription: req.body.userDescription,
    });

    return sendResponse(res, httpStatusCodes.ok, {
      message: "Descripción de usuario actualizada",
      updated,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateJobDescription = async (req, res, next) => {
  try {
    const updated = await UserService.updateProfileByUid(req.params.uid, {
      job_description: req.body.job_description,
    });

    return sendResponse(res, httpStatusCodes.ok, {
      message: "Descripción del trabajo actualizada",
      updated,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const updated = await UserService.updateProfileByUid(req.params.uid, {
      location: req.body.location,
    });

    return sendResponse(res, httpStatusCodes.ok, {
      message: "Ubicación actualizada",
      updated,
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePhone = async (req, res, next) => {
  try {
    const updated = await UserService.updateProfileByUid(req.params.uid, {
      phoneNumber: req.body.phone,
    });

    return sendResponse(res, httpStatusCodes.ok, {
      message: "Teléfono actualizado",
      updated,
    });
  } catch (err) {
    next(err);
  }
};

/* ======================== FOTOS DE TRABAJO ======================== */

exports.uploadJobPhoto = async (req, res, next) => {
  try {
    const newImage = await UserService.uploadJobPhoto(req.params.uid, req.body.photoUrl);

    return sendResponse(res, 201, {
      message: "Imagen subida correctamente",
      image: newImage,
    });
  } catch (err) {
    console.error("❌ ERROR SUBIENDO FOTO:", err);
    next(err);
  }
};


exports.deleteJobPhoto = async (req, res, next) => {
  try {
    const imageId = req.body.id || req.query.id;
    const result = await UserService.deleteJobPhoto(req.params.uid, imageId);
    return sendResponse(res, httpStatusCodes.ok, result);
  } catch (err) {
    next(err);
  }
};

/* ======================= FOTO DE PERFIL ======================= */

exports.updateProfilePic = async (req, res, next) => {
  try {
    const result = await UserService.updateProfilePic(req.params.uid, req.body.imageProfile);
    return sendResponse(res, httpStatusCodes.ok, result);
  } catch (err) {
    next(err);
  }
};

/* =================== ACTUALIZAR PERFIL DE WORKER =================== */

exports.updateProfileWorker = async (req, res, next) => {
  try {
    const result = await UserService.updateProfileWorker(req.params.uid, req.body);

    await updateUserSync(req.params.uid, {
      name: req.body.name,
      email: req.body.email,
      is_worker: req.body.is_worker || false,
      created_at: req.body.created_at,
      job: req.body.id_job || null,
    });

    return sendResponse(res, httpStatusCodes.ok, result);
  } catch (err) {
    next(err);
  }
};

/* ====================== LISTAR Y BUSCAR WORKERS ====================== */

exports.getAllWorkers = async (req, res, next) => {
  try {
    const result = await UserService.getAllWorkers();
    return sendResponse(res, httpStatusCodes.ok, result);
  } catch (err) {
    next(err);
  }
};

exports.searchWorkers = async (req, res, next) => {
  try {
    const result = await UserService.searchWorkers(req.query.search, req.query.id_job);
    return sendResponse(res, httpStatusCodes.ok, result);
  } catch (err) {
    next(err);
  }
};

/* ====================== FOTOS DE USUARIO ====================== */

exports.getUserPhotos = async (req, res, next) => {
  try {
    const urls = await UserService.getUserPhotos(req.params.uid);
    return sendResponse(res, httpStatusCodes.ok, urls);
  } catch (err) {
    next(err);
  }
};
