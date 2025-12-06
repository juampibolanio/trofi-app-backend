const express = require("express");
const cors = require("cors");
const errorHandler = require("../middlewares/errorHandler.middleware");

const app = express();

app.use(cors());
app.use(express.json());

const reviewsRoutes = require("../routes/reviews.routes");

app.use(reviewsRoutes);

app.use(errorHandler);

module.exports = app;
