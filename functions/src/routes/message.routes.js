/* eslint-disable new-cap */
const express = require("express");
const router = express.Router();

const messageController = require("../controllers/message.controller");

// Crear/obtener chat entre dos usuarios
router.post("/start", messageController.startChat);

// Obtener chats del usuario
router.get("/user/:uid", messageController.getUserChats);

// Obtener mensajes de un chat
router.get("/:chatId/messages", messageController.getMessages);

// Enviar mensaje en un chat
router.post("/:chatId/message", messageController.sendMessage);

// Eliminar chat (soft delete)
router.delete("/:chatId/user/:uid", messageController.deleteChat);

// Eliminar mensaje individual
router.delete("/:chatId/message/:messageId", messageController.deleteMessage);

// Marcar mensajes como leídos
router.put("/:chatId/read", messageController.markAsRead);

module.exports = router;
