import Driver from "../models/Driver.js";
import Ride from "../models/Ride.js";

// CREATE RIDE
export const createRide = async (req, res) => {
  try {
    const {
      driverId,
      route,
      travelDate,
      startTime,
      pricing,
      parcelAllowed,
      parcelHeight,
      parcelWidth,
    } = req.body;

    // Verify driver exists in the 'drivers' collection
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Prevent past dates
    if (new Date(travelDate) < new Date()) {
      return res.status(400).json({ message: "Invalid travel date" });
    }

    const ride = await Ride.create({
      driverId: driver._id,
      route,
      travelDate,
      startTime,
      pricing,
      parcelAllowed,
      parcelConstraints: parcelAllowed
        ? { maxHeight: parcelHeight || null, maxWidth: parcelWidth || null }
        : null,
      totalSeats: driver.vehicle.seatingCapacity, // Pulls from Driver model
      availableSeats: driver.vehicle.seatingCapacity,
      availableSeatsUpdatedAt: new Date(),
    });

    res.status(201).json(ride);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CANCEL RIDE
export const cancelRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (["CANCELLED", "COMPLETED", "ONGOING"].includes(ride.status)) {
      return res.status(400).json({ message: `Cannot cancel ride in ${ride.status} status` });
    }

    ride.status = "CANCELLED";
    await ride.save();

    res.json({ message: "Ride cancelled successfully", ride });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SEARCH RIDE
export const searchRide = async (req, res) => {
  try {
    const { startCity, endCity, travelDate } = req.query;

    // Base filter: Only show rides that are "OPEN" and have seats > 0
    let query = {
      status: "OPEN",
      availableSeats: { $gt: 0 }
    };

    // Filter by start city using dot notation for nested objects
    if (startCity) {
      query["route.startCity"] = { $regex: startCity, $options: "i" };
    }

    // Filter by end city using dot notation
    if (endCity) {
      query["route.endCity"] = { $regex: endCity, $options: "i" };
    }

    // Filter by travel date if provided
    if (travelDate) {
      query.travelDate = new Date(travelDate);
    }

    // Execute search and sort by startTime
    const rides = await Ride.find(query).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: rides.length,
      data: rides
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};