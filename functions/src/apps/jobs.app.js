const express = require("express");
const cors = require("cors");
const errorHandler = require("../middlewares/errorHandler.middleware");

const app = express();

app.use(cors());
app.use(express.json());

const jobsRoutes = require("../routes/jobs.routes");

app.use(jobsRoutes);

app.use(errorHandler);

module.exports = app;
