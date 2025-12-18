import Ride from "../models/Ride.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// --- CREATE BOOKING ---
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { rideId, passengerId, seatsBooked } = req.body;

    if (!rideId || !passengerId || !seatsBooked) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findById(passengerId);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found." });
    }

    const ride = await Ride.findById(rideId).session(session);
    if (!ride || ride.status !== "OPEN") {
      await session.abortTransaction();
      return res.status(400).json({ message: "Ride not available" });
    }

    if (seatsBooked > ride.availableSeats) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Not enough seats" });
    }

    const booking = await Booking.create([{ rideId, passengerId, seatsBooked }], { session });

    // Deduct seats and update timestamp from your new Schema
    ride.availableSeats -= seatsBooked;
    ride.availableSeatsUpdatedAt = Date.now(); 
    if (ride.availableSeats === 0) ride.status = "FULL";

    await ride.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: `Confirmed for ${user.firstName}`, booking: booking[0] });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ message: err.message });
  }
};

// --- READ ALL ---
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("rideId")
      .populate("passengerId", "firstName lastName email phone");
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- READ ONE ---
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("rideId passengerId");
    if (!booking) return res.status(404).json({ message: "Not found" });
    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- UPDATE SEATS ---
export const updateBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { seatsBooked } = req.body;
    const booking = await Booking.findById(req.params.id).session(session);
    const ride = await Ride.findById(booking.rideId).session(session);
    
    const diff = seatsBooked - booking.seatsBooked;
    if (ride.availableSeats < diff) throw new Error("No seats left");

    ride.availableSeats -= diff;
    ride.availableSeatsUpdatedAt = Date.now(); // Update timestamp
    ride.status = ride.availableSeats === 0 ? "FULL" : "OPEN";
    
    booking.seatsBooked = seatsBooked;

    await ride.save({ session });
    await booking.save({ session });

    await session.commitTransaction();
    res.status(200).json({ message: "Updated", booking });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

// --- DELETE / CANCEL ---
export const deleteBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const booking = await Booking.findById(req.params.id).session(session);
    const ride = await Ride.findById(booking.rideId).session(session);
    
    ride.availableSeats += booking.seatsBooked;
    ride.availableSeatsUpdatedAt = Date.now(); // Update timestamp
    if (ride.status === "FULL") ride.status = "OPEN";

    await ride.save({ session });
    await Booking.findByIdAndDelete(req.params.id).session(session);

    await session.commitTransaction();
    res.status(200).json({ message: "Cancelled" });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
};


