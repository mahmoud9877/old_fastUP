require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const ErrorMiddleware = require("./middleware/error");
const path = require("path");
const userRouter = require("./routes/authRoutes");
const shipmentRouter = require("./routes/shipmentRoute");

module.exports = app;

app.use(express.json({ limit: "50mb" }));

app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);
// routes

app.use("/api/v1/auth", userRouter);
app.use("/api/v1", shipmentRouter);
app.use("/api/v1", shipmentRouter);

// testing api
app.get("/test", (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

// unknown route
app.all("*", (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
