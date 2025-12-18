import Ride from "../models/Ride.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js"; // Import the User model to verify existence
import mongoose from "mongoose";

export const createBooking = async (req, res) => {
  // Start a session for a safe transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { rideId, passengerId, seatsBooked } = req.body;

    // 1. Validate required fields
    if (!rideId || !passengerId || !seatsBooked) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 2. VERIFY USER EXISTS: Ensures only registered users can book
    const user = await User.findById(passengerId);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found. Registration required." });
    }

    // 3. Find Ride and check status (within the session)
    const ride = await Ride.findById(rideId).session(session);
    if (!ride) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "OPEN") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Bookings allowed only for OPEN rides" });
    }

    // 4. Check seat availability
    if (seatsBooked > ride.availableSeats) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Not enough seats available" });
    }

    // 5. Create the booking document
    const booking = await Booking.create(
      [{ rideId, passengerId, seatsBooked }], 
      { session }
    );

    // 6. Deduct seats and update status
    ride.availableSeats -= seatsBooked;
    if (ride.availableSeats === 0) {
      ride.status = "FULL";
    }

    await ride.save({ session });

    // Commit all changes to the database
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: `Booking confirmed for ${user.firstName}`,
      booking: booking[0],
      remainingSeats: ride.availableSeats
    });

  } catch (err) {
    // If anything goes wrong, undo everything
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};