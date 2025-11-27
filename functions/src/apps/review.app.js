const express = require("express");
const cors = require("cors");
const errorHandler = require("../middlewares/errorHandler.middleware");

const app = express();

app.use(cors());
app.use(express.json());

const reviewsRoutes = require("../routes/reviews.routes");

// Rutas de reseñas
app.use(reviewsRoutes);

// Test & Health
app.get("/_health", (req, res) => res.json({ok: true}));

// Handler global de errores
app.use(errorHandler);

module.exports = app;
