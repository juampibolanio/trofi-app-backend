const express = require("express");
const cors = require("cors");
const errorHandler = require("../middlewares/errorHandler.middleware");
const app = express();

app.use(cors());
app.use(express.json());

// Rutas de usuarios
const userRoutes = require("../routes/user.routes");
app.use(userRoutes);

// Test & Health
app.get("/_health", (req, res) => res.json({ok: true}));

app.get('/test', (req, res) => {
    res.json({ message: "La ruta test de users funciona." });
});
// Manejador de errores
app.use(errorHandler);

module.exports = app;
