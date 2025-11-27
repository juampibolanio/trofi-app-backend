const axios = require('axios');

const djangoUrl = 'URL_LOCAL_DJANGO';

const syncUser = async (userData) => {
    return await axios.post(`${djangoUrl}/sync/users/`, userData);
}

const updateUserSync = async (uid, userData) => {
    return await axios.put(`${djangoUrl}/sync/users/${uid}/`, userData);
}

const syncJob = async(jobData) => {
    return await axios.post(`${djangoUrl}/sync/jobs/`, jobData);
};

const updateJobSync = async (id, jobData) => {
    return await axios.put(`${djangoUrl}/sync/jobs/${id}/`, jobData);
}

const deleteJobSync = async (id) => {
    return await axios.delete(`${djangoUrl}/sync/jobs/${id}/`);
}

const syncReview = async (reviewData) => {
    return await axios.post(`${djangoUrl}/sync/reviews/`, reviewData);
}

const deleteReviewSync = async(id) => {
    return await axios.delete(`${djangoUrl}/sync/reviews/${id}/`);
}

module.exports = {
    syncUser,
    syncReview,
    syncJob,
    deleteJobSync,
    deleteReviewSync,
    updateJobSync,
    updateUserSync
}