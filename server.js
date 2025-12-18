import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Import Routes
import authRoutes from "./routes/auth.routes.js"; 
import driverRoutes from "./routes/driverRoutes.js";
import rideRoutes from "./routes/rideRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"


// This prefix must match your request

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. User Auth (Signup & Login)
app.use("/api/auth", authRoutes);

// 2. Driver Auth (Specialized Signup & Management)
app.use("/api/driver", driverRoutes);

// 4. Booking Management (Full CRUD: Create, Read, Update, Delete)
app.use("/api/bookings", bookingRoutes);


// This prefix must match your request
app.use("/api/rides", rideRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
}).catch(err => {
  console.error("Database connection failed:", err);
});