import express from "express";
import { searchRide, createRide } from "../controllers/rideController.js";

const router = express.Router();

// Route to create a new ride
router.post("/create", createRide);

// Route to cancel an existing ride

// --- Search

router.get("/search", searchRide); // Crucial for your Postman search


export default router;

