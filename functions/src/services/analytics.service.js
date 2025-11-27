/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */
/**
 * Analytics Service
 * - Servicio para sincronizar datos con Django Analytics API
 */

const axios = require("axios");

const djangoUrl = process.env.DJANGO_API_URL || "http://127.0.0.1:8000/api";

/**
 * Sincroniza un usuario con Django
 */
const syncUser = async (userData) => {
  try {
    const response = await axios.post(`${djangoUrl}/sync/users/`, userData, {
      timeout: 5000,
    });
    console.log("✅ Usuario sincronizado con Django:", userData.uid);
    return response.data;
  } catch (error) {
    console.error("❌ Error sincronizando usuario con Django:", error.message);
    // No lanzamos error para que no afecte la operación principal
    return null;
  }
};

/**
 * Actualiza un usuario en Django
 */
const updateUserSync = async (uid, userData) => {
  try {
    const response = await axios.put(`${djangoUrl}/sync/users/${uid}/`, userData, {
      timeout: 5000,
    });
    console.log("✅ Usuario actualizado en Django:", uid);
    return response.data;
  } catch (error) {
    console.error("❌ Error actualizando usuario en Django:", error.message);
    return null;
  }
};

/**
 * Sincroniza un oficio con Django
 */
const syncJob = async (jobData) => {
  try {
    const response = await axios.post(`${djangoUrl}/sync/jobs/`, {
      firebase_key: jobData.id,
      name: jobData.name,
    });
    console.log("✅ Oficio sincronizado con Django:", jobData.id);
    return response.data;
  } catch (error) {
    console.error("❌ Error sincronizando oficio con Django:", error.message);
    return null;
  }
};

/**
 * Actualiza un oficio en Django
 */
const updateJobSync = async (id, jobData) => {
  try {
    const response = await axios.put(`${djangoUrl}/sync/jobs/${id}/`, {
      firebase_key: id,
      name: jobData.name,
    });
    console.log("✅ Oficio actualizado en Django:", id);
    return response.data;
  } catch (error) {
    console.error("❌ Error actualizando oficio en Django:", error.message);
    return null;
  }
};

/**
 * Elimina un oficio en Django
 */
const deleteJobSync = async (id) => {
  try {
    const response = await axios.delete(`${djangoUrl}/sync/jobs/${id}/`, {
      timeout: 5000,
    });
    console.log("✅ Oficio eliminado en Django:", id);
    return response.data;
  } catch (error) {
    console.error("❌ Error eliminando oficio en Django:", error.message);
    return null;
  }
};

/**
 * Sincroniza una reseña con Django
 */
const syncReview = async (reviewData) => {
  try {
    const response = await axios.post(`${djangoUrl}/sync/reviews/`, reviewData, {
      timeout: 5000,
    });
    console.log("✅ Reseña sincronizada con Django:", reviewData.id);
    return response.data;
  } catch (error) {
    console.error("❌ Error sincronizando reseña con Django:", error.message);
    return null;
  }
};

/**
 * Elimina una reseña en Django
 */
const deleteReviewSync = async (id) => {
  try {
    const response = await axios.delete(`${djangoUrl}/sync/reviews/${id}/`, {
      timeout: 5000,
    });
    console.log("✅ Reseña eliminada en Django:", id);
    return response.data;
  } catch (error) {
    console.error("❌ Error eliminando reseña en Django:", error.message);
    return null;
  }
};

/**
 * Obtiene estadísticas de usuarios desde Django
 */
const getUsersStats = async () => {
  try {
    const response = await axios.get(`${djangoUrl}/analytics/users/`, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas de usuarios:", error.message);
    throw error;
  }
};

/**
 * Obtiene estadísticas de trabajadores desde Django
 */
const getWorkersStats = async () => {
  try {
    const response = await axios.get(`${djangoUrl}/analytics/workers/`, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas de trabajadores:", error.message);
    throw error;
  }
};

/**
 * Obtiene estadísticas de reseñas desde Django
 */
const getReviewsStats = async () => {
  try {
    const response = await axios.get(`${djangoUrl}/analytics/reviews/`, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas de reseñas:", error.message);
    throw error;
  }
};

module.exports = {
  syncUser,
  updateUserSync,
  syncJob,
  updateJobSync,
  deleteJobSync,
  syncReview,
  deleteReviewSync,
  getUsersStats,
  getWorkersStats,
  getReviewsStats,
};
