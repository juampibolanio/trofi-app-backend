const express = require("express");
const cors = require("cors");
const errorHandler = require("../middlewares/errorHandler.middleware");

const app = express();

app.use(cors());
app.use(express.json());

const jobsRoutes = require("../routes/jobs.routes");

// Rutas
app.use(jobsRoutes);

// Manejador de errores
app.use(errorHandler);

// Test
app.get("/_health", (req, res) => {
  res.json({ok: true});
});

module.exports = app;
