import Ride from "../models/ride.js";

export const getDriverRides = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status, fromDate, toDate } = req.query;

    const query = { driverId };

    if (status) {
      query.status = status;
    }

    if (fromDate || toDate) {
      query.travelDate = {};
      if (fromDate) query.travelDate.$gte = new Date(fromDate);
      if (toDate) query.travelDate.$lte = new Date(toDate);
    }

    const rides = await Ride.find(query).sort({ travelDate: 1 });

    const dashboardData = rides.map((ride) => {
      const bookedSeats = ride.totalSeats - ride.availableSeats;

      const seatEarnings = bookedSeats * (ride.pricing?.pricePerSeat || 0);

      return {
        rideId: ride._id,
        route: `${ride.route.startCity} → ${ride.route.endCity}`,
        travelDate: ride.travelDate,
        startTime: ride.startTime,
        status: ride.status,
        totalSeats: ride.totalSeats,
        availableSeats: ride.availableSeats,
        bookedSeats,
        expectedEarnings: seatEarnings,
        parcelAllowed: ride.parcelAllowed,
      };
    });

    res.json({
      totalRides: dashboardData.length,
      rides: dashboardData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
