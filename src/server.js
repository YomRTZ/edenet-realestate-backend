import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";


// ROUTES
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import propertyRoutes from "./routes/property.routes.js";
import propertyImageRoutes from "./routes/propertyImage.routes.js";
import propertyFeatureRoutes from "./routes/propertyFeature.routes.js";
import propertyDocumentRoutes from "./routes/propertyDocument.routes.js";
import propertyVerificationRoutes from "./routes/propertyVerification.routes.js";
import propertyOwnershipRoutes from "./routes/propertyOwnership.routes.js";
import rentalAgreementRoutes from "./routes/rentalAgreement.routes.js";
import rentalPaymentRoutes from "./routes/rentalPayment.routes.js";
import maintenanceRequestRoutes from "./routes/maintenanceRequest.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";
import saleTransactionRoutes from "./routes/saleTransaction.routes.js";
import escrowTransactionRoutes from "./routes/escrowTransaction.routes.js";
import mortgageRoutes from "./routes/mortgage.routes.js";
import propertyTaxRoutes from "./routes/propertyTax.routes.js";
import propertyInquiryRoutes from "./routes/propertyInquiry.routes.js";
import propertyReviewRoutes from "./routes/propertyReview.routes.js";
import showingRoutes from "./routes/showing.routes.js";
import userReviewRoutes from "./routes/userReview.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";
import savedSearchRoutes from "./routes/savedSearch.routes.js";
import propertyComparisonRoutes from "./routes/propertyComparison.routes.js";
import propertyViewRoutes from "./routes/propertyView.routes.js";
import userDocumentRoutes from "./routes/userDocument.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminAuditLogRoutes from './routes/adminAuditLog.routes.js';
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
app.use("/properties", propertyRoutes);
app.use("/properties", propertyImageRoutes);
app.use("/properties", propertyFeatureRoutes);
app.use("/properties", propertyDocumentRoutes);
app.use("/properties", propertyVerificationRoutes);
app.use("/properties", propertyOwnershipRoutes);
app.use("/properties", rentalAgreementRoutes);
app.use("/properties", rentalPaymentRoutes);
app.use("/properties", maintenanceRequestRoutes);
app.use("/properties", availabilityRoutes);
app.use("/properties", saleTransactionRoutes);
app.use("/properties", propertyTaxRoutes);
app.use("/properties", propertyInquiryRoutes);
app.use("/properties", propertyReviewRoutes);
app.use("/properties", showingRoutes);
app.use("/properties", mortgageRoutes);
app.use("/properties", escrowTransactionRoutes);
app.use("/users", userReviewRoutes);
app.use("/properties", favoriteRoutes);
app.use("/users", savedSearchRoutes);
app.use('/', propertyComparisonRoutes);
app.use('/properties', propertyViewRoutes);
app.use('/users', userDocumentRoutes);
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
