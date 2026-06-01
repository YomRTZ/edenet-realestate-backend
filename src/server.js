import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";


// ROUTES
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import propertyFeatureRoutes from "./routes/propertyFeature.routes.js";
import propertyOwnershipRoutes from "./routes/propertyOwnership.routes.js";
import rentalAgreementRoutes from "./routes/rentalAgreement.routes.js";
import rentalPaymentRoutes from "./routes/rentalPayment.routes.js";
import maintenanceRequestRoutes from "./routes/maintenanceRequest.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";
import saleTransactionRoutes from "./routes/saleTransaction.routes.js";
import escrowTransactionRoutes from "./routes/escrowTransaction.routes.js";
import propertyTaxRoutes from "./routes/propertyTax.routes.js";
import propertyInquiryRoutes from "./routes/propertyInquiry.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import showingRoutes from "./routes/showing.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";
import savedSearchRoutes from "./routes/savedSearch.routes.js";
import documentRoutes from './routes/document.routes.js';
// PropertyComparison and PropertyView routes removed; lightweight placeholders used when needed.
import notificationRoutes from "./routes/notification.routes.js";
import adminAuditLogRoutes from './routes/adminAuditLog.routes.js';
// MIDDLEWARES
import { errorHandler } from "./middlewares/error.middleware.js";
import { AppError } from "./utils/AppError.js";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

/* -------------------- CORE MIDDLEWARES -------------------- */
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use("/properties", propertyRoutes);
app.use("/properties", propertyFeatureRoutes);
app.use("/properties", propertyOwnershipRoutes);
app.use("/properties", rentalAgreementRoutes);
app.use("/properties", rentalPaymentRoutes);
app.use("/properties", maintenanceRequestRoutes);
app.use("/properties", availabilityRoutes);
app.use("/properties", saleTransactionRoutes);
app.use("/properties", propertyTaxRoutes);
app.use("/properties", propertyInquiryRoutes);
app.use("/properties", showingRoutes);
app.use("/properties", escrowTransactionRoutes);
app.use("/properties", favoriteRoutes);
app.use('/', reviewRoutes);
app.use("/users", savedSearchRoutes);
app.use('/', documentRoutes);
// PropertyComparison and PropertyView route registrations removed.

app.use('/', notificationRoutes);
app.use('/admin', adminAuditLogRoutes);

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
