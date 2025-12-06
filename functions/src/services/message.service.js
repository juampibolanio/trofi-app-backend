/* eslint-disable max-len */
const admin = require("../../config/firebase");
const db = admin.database();

const DataValidationError = require("../errors/DataValidationError");
const ResourceNotFoundError = require("../errors/ResourceNotFoundError");
const DatabaseError = require("../errors/DatabaseError");
const AuthorizationError = require("../errors/AuthorizationError");

class MessageService {
  /**
   * Crea un nuevo chat entre dos usuarios o retorna el existente.
   * @param {string} senderId - UID del remitente
   * @param {string} receiverId - UID del destinatario
   * @param {string} content - Mensaje inicial (opcional)
   * @return {string} chatId
   */
  async createChat(senderId, receiverId, content = "") {
    if (!senderId || !receiverId) {
      throw new DataValidationError("Los IDs de remitente y destinatario son requeridos");
    }

    if (senderId === receiverId) {
      throw new DataValidationError("No puedes crear un chat contigo mismo");
    }

    try {
      // Crear chatId
      const participants = [senderId, receiverId].sort();
      const chatId = `${participants[0]}_${participants[1]}`;

      const chatRef = db.ref(`chats/${chatId}`);
      const chatSnapshot = await chatRef.once("value");

      // Si el chat ya existe, retornar su ID
      if (chatSnapshot.exists()) {
        return chatId;
      }

      // Crear nuevo chat
      const timestamp = Date.now();

      const newChatData = {
        participants,
        lastMessage: content || "",
        timestamp,
        readBy: {
          [senderId]: true,
        },
        deletedBy: {},
      };

      await chatRef.set(newChatData);

      // Si hay mensaje inicial, agregarlo
      if (content && content.trim()) {
        const messagesRef = db.ref(`chats/${chatId}/messages`);
        await messagesRef.push({
          senderId,
          content: content.trim(),
          timestamp,
        });
      }

      return chatId;
    } catch (err) {
      if (err instanceof DataValidationError) throw err;
      throw new DatabaseError(err.message || "Error al crear chat");
    }
  }

  /**
   * Envía un mensaje en un chat existente
   * @param {string} chatId - ID del chat
   * @param {string} senderId - UID del remitente
   * @param {string} content - Contenido del mensaje
   * @return {object} Mensaje creado con ID
   */
  async sendMessage(chatId, senderId, content) {
    if (!chatId || !senderId || !content) {
      throw new DataValidationError("chatId, senderId y content son requeridos");
    }

    if (content.length > 500) {
      throw new DataValidationError("El mensaje no puede exceder 500 caracteres");
    }

    try {
      const chatRef = db.ref(`chats/${chatId}`);
      const chatSnapshot = await chatRef.once("value");

      if (!chatSnapshot.exists()) {
        throw new ResourceNotFoundError("Chat no encontrado");
      }

      const chatData = chatSnapshot.val();

      // Verificar que el usuario es parte del chat
      if (!chatData.participants || !chatData.participants.includes(senderId)) {
        throw new AuthorizationError("No tienes permiso para enviar mensajes en este chat");
      }

      const timestamp = Date.now();

      const newMessage = {
        senderId,
        content: content.trim(),
        timestamp,
      };

      // Agregar mensaje
      const messagesRef = db.ref(`chats/${chatId}/messages`);
      const newMessageRef = await messagesRef.push(newMessage);

      // Actualizar último mensaje del chat
      await chatRef.update({
        lastMessage: content.trim(),
        timestamp,
        readBy: {
          [senderId]: true,
        },
      });

      return {
        id: newMessageRef.key,
        ...newMessage,
      };
    } catch (err) {
      if (
        err instanceof DataValidationError ||
        err instanceof ResourceNotFoundError ||
        err instanceof AuthorizationError
      ) {
        throw err;
      }
      throw new DatabaseError(err.message || "Error al enviar mensaje");
    }
  }

  /**
   * Obtiene los mensajes de un chat
   * @param {string} chatId - ID del chat
   * @param {number} limit - Límite de mensajes (default: 50)
   * @return {Array} Lista de mensajes ordenados cronológicamente
   */
  async getMessages(chatId, limit = 50) {
    if (!chatId) {
      throw new DataValidationError("chatId es requerido");
    }

    try {
      const chatRef = db.ref(`chats/${chatId}`);
      const chatSnapshot = await chatRef.once("value");

      if (!chatSnapshot.exists()) {
        throw new ResourceNotFoundError("Chat no encontrado");
      }

      const messagesRef = db.ref(`chats/${chatId}/messages`);
      const messagesSnapshot = await messagesRef
          .orderByChild("timestamp")
          .limitToLast(limit)
          .once("value");

      const messagesData = messagesSnapshot.val();

      if (!messagesData) {
        return [];
      }

      // Convertir objeto a array y ordenar cronológicamente
      const messages = Object.entries(messagesData).map(([key, value]) => ({
        id: key,
        senderId: value.senderId,
        content: value.content,
        timestamp: value.timestamp,
      }));

      // Ordenar por timestamp ascendente
      messages.sort((a, b) => a.timestamp - b.timestamp);

      return messages;
    } catch (err) {
      if (err instanceof DataValidationError || err instanceof ResourceNotFoundError) {
        throw err;
      }
      throw new DatabaseError(err.message || "Error al obtener mensajes");
    }
  }

  /**
   * Obtiene todos los chats de un usuario
   * @param {string} userId - UID del usuario
   * @return {Array} Lista de chats activos
   */
  async getUserChats(userId) {
    if (!userId) {
      throw new DataValidationError("userId es requerido");
    }

    try {
      const chatsRef = db.ref("chats");
      const chatsSnapshot = await chatsRef.once("value");

      const chatsData = chatsSnapshot.val();

      if (!chatsData) {
        return [];
      }

      // Filtrar chats donde el usuario es participante y no ha eliminado
      const activeChats = [];

      for (const [chatId, chatData] of Object.entries(chatsData)) {
        // Verificar que el usuario es participante
        if (!chatData.participants || !chatData.participants.includes(userId)) {
          continue;
        }

        // Verificar que el usuario no haya eliminado el chat
        const deletedBy = chatData.deletedBy || {};
        if (deletedBy[userId]) {
          continue;
        }

        activeChats.push({
          id: chatId,
          participants: chatData.participants,
          lastMessage: chatData.lastMessage || "",
          timestamp: chatData.timestamp || 0,
          readBy: chatData.readBy || {},
        });
      }

      // Ordenar por timestamp descendente (más recientes primero)
      activeChats.sort((a, b) => b.timestamp - a.timestamp);

      return activeChats;
    } catch (err) {
      if (err instanceof DataValidationError) throw err;
      throw new DatabaseError(err.message || "Error al obtener chats del usuario");
    }
  }

  /**
   * Elimina un mensaje (solo el remitente puede eliminarlo)
   * @param {string} chatId - ID del chat
   * @param {string} messageId - ID del mensaje
   * @param {string} userId - UID del usuario que elimina
   * @return {object} Confirmación
   */
  async deleteMessage(chatId, messageId, userId) {
    if (!chatId || !messageId || !userId) {
      throw new DataValidationError("chatId, messageId y userId son requeridos");
    }

    try {
      const messageRef = db.ref(`chats/${chatId}/messages/${messageId}`);
      const messageSnapshot = await messageRef.once("value");

      if (!messageSnapshot.exists()) {
        throw new ResourceNotFoundError("Mensaje no encontrado");
      }

      const messageData = messageSnapshot.val();

      // Verificar que el usuario es el remitente
      if (messageData.senderId !== userId) {
        throw new AuthorizationError("No tienes permiso para eliminar este mensaje");
      }

      await messageRef.remove();

      return {message: "Mensaje eliminado correctamente"};
    } catch (err) {
      if (
        err instanceof DataValidationError ||
        err instanceof ResourceNotFoundError ||
        err instanceof AuthorizationError
      ) {
        throw err;
      }
      throw new DatabaseError(err.message || "Error al eliminar mensaje");
    }
  }

  /**
   * Marca un chat como eliminado para un usuario (soft delete)
   * @param {string} chatId - ID del chat
   * @param {string} userId - UID del usuario
   * @return {object} Confirmación
   */
  async deleteChat(chatId, userId) {
    if (!chatId || !userId) {
      throw new DataValidationError("chatId y userId son requeridos");
    }

    try {
      const chatRef = db.ref(`chats/${chatId}`);
      const chatSnapshot = await chatRef.once("value");

      if (!chatSnapshot.exists()) {
        throw new ResourceNotFoundError("Chat no encontrado");
      }

      const chatData = chatSnapshot.val();

      // Verificar que el usuario es participante
      if (!chatData.participants || !chatData.participants.includes(userId)) {
        throw new AuthorizationError("No tienes permiso para eliminar este chat");
      }

      // marcar como eliminado para este usuario
      await chatRef.child("deletedBy").update({
        [userId]: true,
      });

      return {message: "Chat eliminado correctamente"};
    } catch (err) {
      if (
        err instanceof DataValidationError ||
        err instanceof ResourceNotFoundError ||
        err instanceof AuthorizationError
      ) {
        throw err;
      }
      throw new DatabaseError(err.message || "Error al eliminar chat");
    }
  }

  /**
   * Marca mensajes como leídos
   * @param {string} chatId - ID del chat
   * @param {string} userId - UID del usuario que leyó
   * @return {object} Confirmación
   */
  async markAsRead(chatId, userId) {
    if (!chatId || !userId) {
      throw new DataValidationError("chatId y userId son requeridos");
    }

    try {
      const chatRef = db.ref(`chats/${chatId}`);
      const chatSnapshot = await chatRef.once("value");

      if (!chatSnapshot.exists()) {
        throw new ResourceNotFoundError("Chat no encontrado");
      }

      // Marcar como leído para este usuario
      await chatRef.child("readBy").update({
        [userId]: true,
      });

      return {message: "Mensajes marcados como leídos"};
    } catch (err) {
      if (err instanceof DataValidationError || err instanceof ResourceNotFoundError) {
        throw err;
      }
      throw new DatabaseError(err.message || "Error al marcar mensajes como leídos");
    }
  }
}

module.exports = new MessageService();
