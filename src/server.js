import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";


// ROUTES
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
// MIDDLEWARES
import { errorHandler } from "./middlewares/error.middleware.js";
import { AppError } from "./utils/AppError.js";


dotenv.config();

const app = express();
const httpServer = createServer(app);

/* -------------------- CORE MIDDLEWARES -------------------- */
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

/* -------------------- CORS CONFIG -------------------- */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server & Postman
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    exposedHeaders: ['Authorization'], 
  })
);


/* -------------------- HEALTH CHECK -------------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EDENET RealEstate API is running",
    version: "1.0.0",
  });
});


/* -------------------- ROUTES -------------------- */
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

/* -------------------- 404 HANDLER -------------------- */
app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

/* -------------------- GLOBAL ERROR HANDLER -------------------- */
app.use(errorHandler);

/* -------------------- SERVER -------------------- */
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

});

export default app;
