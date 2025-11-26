const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');

router.post('/register', userController.registerWorker);
router.get('/', userController.getAllWorkers);
router.get('/search', userController.searchWorkers);
router.get('/photos/:uid', userController.getUserPhotos);
router.get('/email/:email', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.patch('/profile/:uid', userController.updateProfileWorker);
router.patch('/profile/pic/:uid', userController.updateProfilePic);
router.post('/photo/:uid', userController.uploadJobPhoto);
router.delete('/photo/:uid', userController.deleteJobPhoto);

module.exports = router;