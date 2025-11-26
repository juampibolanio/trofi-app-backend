const admin = require('../../config/firebase');

const db = admin.firestore();

const { message } = require('../schemas/message.schema');
const { chat } = require('../schemas/chat.schema');

class MessageService{

    // crear chat
    async createChat(senderId, receiverId, content){

        const participantsIds = [senderId, receiverId];

        const { error, value: finalData } = chat.validate({
            participants: participantsIds,
            initialMessage: content
        });

        if(error){
            // throw new InvalidateError
            throw new Error('Datos invalidos');
        }

        const participants = finalData.participants.sort();

        const chatQuery = await db.collection('chats')
            .where('participants', '==', participants)
            .limit(1)
            .get();

        if(!chatQuery.empty){
            return chatQuery.docs[0].id;
        }

        const timestamp = admin.firestore.FieldValue.serverTimestamp();

        const newChat = await db.collection('chats').add({
            participants: participants,
            lastMessage: finalData.content,
            timestamp: timestamp
        });

        const chatId = newChat.id;

        await db.collection('chats').doc(chatId).collection('messages').add({
            senderId: senderId,
            content: finalData.content,
            timestamp: timestamp
        }); 

        return newChat.id;
    }

    // enviar mensaje

    async sendMessage(chatId, senderId, content){

        const data = {chatId, senderId, content};
        
        const { error, value: finalData } = message.validate(data);

        if(error){
            throw new Error('Datos invalñidos');
        }

        const chatRef = db.collection('chats').doc(finalData.chatId);
        const messageArray = chatRef.collection('messages');
        const timestamp = admin.firestore.FieldValue.serverTimestamp();

        const newMessage = {
            senderId: finalData.senderId,
            content: finalData.content,
            timestamp
        };

        const messageRef = await messageArray.add(newMessage);

        await chatRef.update({
            lastMessage: finalData.content,
            timestamp: timestamp,
            readBy: [finalData.senderId]
        })

        return{
            id: messageRef.id,
            ...newMessage,
            timestamp: Date.now() 
        };

    }

    async getMessages(chatId){

        const messagesSnapshot = await db.collection('chats').doc(chatId)
            .collection('messages')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();

        const messages = messagesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return messages.reverse();
    }

    async getUserChats(userId){
            
        const chatsSnapshot = await db.collection('chats')
            .where('participants', 'array-contains', userId)
            .orderBy('timestamp', 'desc') 
            .get();

        
        const activeChats = chatsSnapshot.docs.filter(doc => {
            const chatData = doc.data();
            
            // lista los mensajes que fueron borrados por el usuario
            const isDeleted = chatData.deletedBy && chatData.deletedBy.includes(userId);
            
            return !isDeleted;
        });
        
        return activeChats.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
    }

    async deleteMessage(chatId, messageId, userId) {
        if (!chatId || !messageId || !userId) {
            throw new Error('todos los datos son requeridos');
        }

        const messageRef = db.collection('chats').doc(chatId).collection('messages').doc(messageId);
        
        
        const messageSnapshot = await messageRef.get();
        if (!messageSnapshot.exists) {
            throw new Error('Mensaje no encontrado.');
            
        }
        
        // esto es para verificar que el que borra el mensaje sea el usuario que lo envio
        if (messageSnapshot.data().senderId !== userId) {
            throw new Error('No autorizado para borrar este mensaje.');
            
        }
        
        await messageRef.delete();
    }

    async deleteChat(chatId, userId) {

        if (!chatId || !userId) {
            throw new Error('Todos los campos son requeridos');
        }

        const chatRef = db.collection('chats').doc(chatId);
        
        // esto almacena quieres borraron el chat, para que solo se oculte para ese usuario
        // y no para ambos, ya que no creo optimo que por borrar uno se le borren a ambos
        await chatRef.update({
            deletedBy: admin.firestore.FieldValue.arrayUnion(userId)
        });
    }

}

module.exports = new MessageService();