const express = require("express");
const cors = require("cors");
const errorHandler = require("../middlewares/errorHandler.middleware");

const app = express();

app.use(cors());
app.use(express.json());

const userRoutes = require('../routes/user.routes');

app.use('/worker', userRoutes);

app.get('/test', (req, res) => {
    res.json({ message: "La ruta test de users funciona." });
});
// Manejador de errores
app.use(errorHandler);

// Test
app.get("/_health", (req, res) => {
  res.json({ok: true});
});

module.exports = app;
