import Driver from "../models/Driver.js";
import Ride from "../models/Ride.js";

// 1. CREATE: Driver posts a new ride
export const createRide = async (req, res) => {
  try {
    const { driverId, route, travelDate, startTime, pricing, parcelAllowed, parcelHeight, parcelWidth } = req.body;

    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    const capacity = driver.vehicleDetails?.capacity || 4;

    const ride = await Ride.create({
      driverId,
      route,
      travelDate,
      startTime,
      pricing,
      parcelAllowed,
      parcelConstraints: parcelAllowed ? { maxHeight: parcelHeight, maxWidth: parcelWidth } : null,
      totalSeats: capacity,
      availableSeats: capacity,
      availableSeatsUpdatedAt: new Date(),
    });

    res.status(201).json({ success: true, data: ride });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. READ (SEARCH): Public search for rides
export const searchRides = async (req, res) => {
  try {
    const { startCity, endCity, travelDate } = req.query;
    let query = { status: "OPEN", availableSeats: { $gt: 0 } };

    if (startCity) query["route.startCity"] = { $regex: startCity, $options: "i" };
    if (endCity) query["route.endCity"] = { $regex: endCity, $options: "i" };

    if (travelDate) {
      const startOfDay = new Date(travelDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(travelDate);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.travelDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const rides = await Ride.find(query).populate("driverId", "firstName vehicleDetails").sort({ startTime: 1 });
    res.status(200).json({ success: true, count: rides.length, data: rides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. READ (SINGLE): Get specific ride details
export const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate("driverId");
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    res.status(200).json({ success: true, data: ride });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. UPDATE: Driver updates pricing or parcel info
export const updateRide = async (req, res) => {
  try {
    const { pricing, parcelAllowed, parcelHeight, parcelWidth } = req.body;
    
    const updateData = { pricing, parcelAllowed };
    if (parcelHeight) updateData["parcelConstraints.maxHeight"] = parcelHeight;
    if (parcelWidth) updateData["parcelConstraints.maxWidth"] = parcelWidth;

    const updatedRide = await Ride.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    );

    if (!updatedRide) return res.status(404).json({ message: "Ride not found" });
    res.status(200).json({ success: true, message: "Ride updated", data: updatedRide });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 5. DELETE/CANCEL: Soft delete by changing status
export const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (["CANCELLED", "COMPLETED"].includes(ride.status)) {
      return res.status(400).json({ message: `Ride is already ${ride.status}` });
    }

    ride.status = "CANCELLED";
    await ride.save();

    res.status(200).json({ success: true, message: "Ride cancelled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};