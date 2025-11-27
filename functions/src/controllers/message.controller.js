/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */
/**
 * MessageController
 * - Controlador para operaciones de mensajería
 */

const MessageService = require("../services/message.service");

/**
 * Inicia un chat o retorna uno existente
 * POST /chat/start
 * Body: { senderId, receiverId, content? }
 */
const startChat = async (req, res, next) => {
  try {
    const {senderId, receiverId, content} = req.body;

    const chatId = await MessageService.createChat(senderId, receiverId, content);

    return res.status(201).json({
      success: true,
      message: "Chat iniciado correctamente",
      data: {chatId},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene todos los chats del usuario autenticado
 * GET /chat/user/:uid
 */
const getUserChats = async (req, res, next) => {
  try {
    const {uid} = req.params;

    const chats = await MessageService.getUserChats(uid);

    return res.status(200).json({
      success: true,
      data: {chats},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene los mensajes de un chat
 * GET /chat/:chatId/messages
 * Query: ?limit=50
 */
const getMessages = async (req, res, next) => {
  try {
    const {chatId} = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await MessageService.getMessages(chatId, limit);

    return res.status(200).json({
      success: true,
      data: {messages},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Envía un mensaje en un chat
 * POST /chat/:chatId/message
 * Body: { senderId, content }
 */
const sendMessage = async (req, res, next) => {
  try {
    const {chatId} = req.params;
    const {senderId, content} = req.body;

    const newMessage = await MessageService.sendMessage(chatId, senderId, content);

    return res.status(201).json({
      success: true,
      message: "Mensaje enviado correctamente",
      data: {message: newMessage},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina un mensaje (solo el remitente)
 * DELETE /chat/:chatId/message/:messageId
 * Body: { userId }
 */
const deleteMessage = async (req, res, next) => {
  try {
    const {chatId, messageId} = req.params;
    const {userId} = req.body;

    await MessageService.deleteMessage(chatId, messageId, userId);

    return res.status(200).json({
      success: true,
      message: "Mensaje eliminado correctamente",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina un chat para el usuario (soft delete)
 * DELETE /chat/:chatId/user/:uid
 */
const deleteChat = async (req, res, next) => {
  try {
    const {chatId, uid} = req.params;

    await MessageService.deleteChat(chatId, uid);

    return res.status(200).json({
      success: true,
      message: "Chat eliminado correctamente",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Marca mensajes como leídos
 * PUT /chat/:chatId/read
 * Body: { userId }
 */
const markAsRead = async (req, res, next) => {
  try {
    const {chatId} = req.params;
    const {userId} = req.body;

    await MessageService.markAsRead(chatId, userId);

    return res.status(200).json({
      success: true,
      message: "Mensajes marcados como leídos",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startChat,
  getUserChats,
  getMessages,
  sendMessage,
  deleteChat,
  deleteMessage,
  markAsRead,
};
