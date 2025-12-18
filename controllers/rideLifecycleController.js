import Ride from "../models/ride.js";

/**
 * START RIDE
 */
export const startRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (!["OPEN", "FULL"].includes(ride.status)) {
      return res.status(400).json({
        message: `Ride cannot be started in ${ride.status} state`,
      });
    }

    ride.status = "ONGOING";
    await ride.save();

    res.json({
      message: "Ride started successfully",
      rideId: ride._id,
      status: ride.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * END RIDE
 */
export const endRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "ONGOING") {
      return res.status(400).json({
        message: "Only ongoing rides can be completed",
      });
    }

    ride.status = "COMPLETED";
    ride.availableSeats = 0;

    await ride.save();

    res.json({
      message: "Ride completed successfully",
      rideId: ride._id,
      status: ride.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
