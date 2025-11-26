const MessageService = require('../services/message.service');

const startChat = async(req, res, next) => {
    try {
        const senderId = req.body.senderId;
        const receiverId = req.body.receiverId;
        const content = req.body.content;

        if(!receiverId){
            return res.status(400).json({
                message: 'El id del destinatario es requerido'
            })
        }

        if(!senderId){
            return res.status(400).json({
                message: 'El id del emisor es requerido'
            })
        }

        const chatId = await MessageService.createChat(senderId, receiverId, content);

        return res.status(201).json({
            message: 'Chat iniciado o encontrado',
            chatId
        })
    } catch (error) {
        next(error)
    }
}

const getUserChat = async (req, res, next) => {
    try {
        const userId = req.body.uid;

        const chats = await MessageService.getUserChats(userId);

        return res.status(200).json(chats);
    } catch (error) {
        next(error)
    }
}

const getMessages = async (req, res, next) => {
    try {
        const { chatId } = req.params;

        if(!chatId){
            return res.status(400).json({
                message: 'El id del chat es requerido'
            })
        }

        const messages = await MessageService.getMessages(chatId);

        return res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
}

const sendMessage = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const senderId = req.body.senderId;
        const content = req.body.content;

        if(!chatId){
            return res.status(400).json({
                message: 'El id del chat es requerido'
            })
        }

        const newMessage = await MessageService.sendMessage(chatId, senderId, content);

        return res.status(201).json({
            message: 'Mensaje enviado',
            messageData: newMessage
        })
    } catch (error) {
        next(error);
    }
}

const deleteMessage = async (req, res, next) => {
    try {
        const { chatId, messageId } = req.body;
        
        const userId = req.params.uid; 
        
        if (!userId) {
            return res.status(400).json({ 
                message: 'el id del usuario es requerido' 
            });
        }

        await MessageService.deleteMessage(chatId, messageId, userId);

        return res.status(204).send(); 
    } catch (error) {
        next(error);
    }
};

const deleteChat = async (req, res, next) => {
    try {
        const chatId = req.params.chatId;
        const userId = req.params.uid; 

        if (!userId) {
            return res.status(400).json({ 
                message: 'El ID del usuario es requerido'
            });
        }
        
        await MessageService.deleteChat(chatId, userId);

        return res.status(204).send(); 
    } catch (error) {
        next(error);
    }
};

module.exports = {
    startChat,
    getUserChat,
    getMessages,
    sendMessage,
    deleteChat,
    deleteMessage
}