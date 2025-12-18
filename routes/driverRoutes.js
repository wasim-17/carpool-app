// src/routes/driverRoutes.js
import express from "express";
import { driverSignup } from "../controllers/driverController.js"; 
// Note: Ensure the function name matches your controller (e.g., driverSignup or createDriver)

const router = express.Router();

// This endpoint triggers the dual-collection save (Users + Drivers)
router.post("/register", driverSignup);

// Placeholder for other routes you mentioned
// router.get("/", getDrivers);
// router.get("/:driverId/rides", getDriverRides);

export default router;