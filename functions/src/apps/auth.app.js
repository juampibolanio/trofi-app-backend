const express = require("express");
const cors = require("cors");
const errorHandler = require("../middlewares/errorHandler.middleware");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("../routes/auth.routes");

// Rutas de autenticación
app.use(authRoutes);

// Test & Health
app.get("/_health", (req, res) => {
  res.json({ok: true});
});

// Handler global de errores
app.use(errorHandler);

module.exports = app;
