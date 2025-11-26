const express = require('express');

const router = express.Router();

const messageController = require('../controllers/message.controller');

router.post('/start', messageController.startChat);

router.get('/user', messageController.getUserChat);

router.get('/:chatId/messages', messageController.getMessages);

router.post('/:chatId/message', messageController.sendMessage);

router.delete('/:chatId/chat/:uid', messageController.deleteChat);

router.delete('/:chatId/message/:uid', messageController.deleteMessage);

module.exports = router;