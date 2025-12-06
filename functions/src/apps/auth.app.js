const express = require("express");
const cors = require("cors");
const errorHandler = require("../middlewares/errorHandler.middleware");

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("../routes/auth.routes");

app.use(authRoutes);

app.use(errorHandler);

module.exports = app;
