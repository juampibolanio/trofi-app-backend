const express = require("express");
const cors = require("cors");
const errorHandler = require("../middlewares/errorHandler.middleware");
const app = express();

app.use(cors());
app.use(express.json());

const userRoutes = require("../routes/user.routes");
app.use(userRoutes);

app.use(errorHandler);

module.exports = app;
