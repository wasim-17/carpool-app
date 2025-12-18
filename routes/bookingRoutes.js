import express from "express";
import { 
  createBooking, 
  getAllBookings, 
  getBookingById, 
  updateBooking, 
  deleteBooking 
} from "../controllers/bookingController.js";

const router = express.Router();

// 1. Create a new booking
router.post("/", createBooking);

// 2. Read all bookings
router.get("/", getAllBookings);

// 3. Read a specific booking
router.get("/:id", getBookingById);

// 4. Update booking (e.g., change seat count)
router.patch("/:id", updateBooking);

// 5. Delete/Cancel booking
router.delete("/:id", deleteBooking);

export default router;