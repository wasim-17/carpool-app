import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Import Routes
import authRoutes from "./routes/auth.routes.js"; 
import driverRoutes from "./routes/driverRoutes.js";
import rideRoutes from "./routes/rideRoutes.js"
import bookingRoutes from "./routes/bookingRoutes.js"
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. User Auth (Signup & Login)
app.use("/api/auth", authRoutes);

// 2. Driver Auth (Specialized Signup & Management)
app.use("/api/driver", driverRoutes);

// ride create
app.use("/api/rides", rideRoutes);

// 3. Booking Management
app.use("/api/bookings", bookingRoutes); // Registered booking route


const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
}).catch(err => {
  console.error("Database connection failed:", err);
});