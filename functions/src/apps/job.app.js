const express = require('express');
const cors = require('cors');

const errorHandler = require('../middlewares/errorHandler.middleware');

const app = express();

app.use(cors());
app.use(express.json());

const jobRoutes = require('../routes/jobs.routes');

app.use('/jobs', jobRoutes);

app.get('/test', (req, res) => {
    res.json({
        message: 'La ruta test de jobs funciona'
    });
});

app.use(errorHandler);

module.exports = app;