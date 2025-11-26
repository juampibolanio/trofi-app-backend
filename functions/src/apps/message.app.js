const express = require('express');
const cors = require('cors');

const errorHandler = require('../middlewares/errorHandler.middleware');

const app = express();

app.use(cors());
app.use(express.json());

const messageRoutes = require('../routes/message.routes');

app.use('/chat', messageRoutes);

app.get('/test', (req, res) => {
    res.json({
        message: 'La ruta test de mensajes funciona'
    });
});

app.use(errorHandler);

module.exports = app;