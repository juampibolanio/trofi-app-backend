const express = require("express");
const cors = require("cors");
const errorHandler = require("../middlewares/errorHandler.middleware");
const app = express();

app.use(cors());
app.use(express.json());

// Rutas de usuarios
const userRoutes = require("../routes/user.routes");
app.use("/users", userRoutes);

// Test & Health
app.get("/_health", (req, res) => res.json({ok: true}));

// Handler global de errores
app.use(errorHandler);

module.exports = app;
