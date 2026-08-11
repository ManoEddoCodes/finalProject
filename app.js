const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/userRoutes.js");
const categoryRoutes = require("./routes/categoryRoutes.js");
const eventRoutes = require("./routes/eventRoutes.js");
const registrationRoutes = require("./routes/registrationRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const healthController = require("./controllers/healthController.js");
const errorHandler = require("./middleware/errorHandler.js");
const AppError = require("./utils/appError.js");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", healthController.getHealth);

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/events", messageRoutes);
app.use("/api/registrations", registrationRoutes);

app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

app.use(errorHandler);

module.exports = app;
