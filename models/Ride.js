import mongoose from "mongoose";

const rideSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver", // References the Driver collection
      required: true,
    },
    route: {
      startCity: { type: String, required: true },
      endCity: { type: String, required: true },
      checkpoints: [{ type: String }], // Array of intermediate stops
    },
    travelDate: { 
      type: Date, 
      required: true 
    },
    startTime: { 
      type: String, 
      required: true 
    },
    pricing: {
      pricePerSeat: { type: Number, required: true },
      fullCarPrice: Number,
      parcelPricePerKg: Number,
    },
    parcelAllowed: {
      type: Boolean,
      default: false,
    },
    parcelConstraints: {
      maxHeight: String,
      maxWidth: String,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["OPEN", "FULL", "CANCELLED", "COMPLETED", "ONGOING"], // Controls the ride lifecycle
      default: "OPEN",
    },
    availableSeatsUpdatedAt: {
      type: Date,
      default: Date.now, // Tracks the last time a booking changed seat count
    },
  },
  { 
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

// Indexing for faster search performance on common queries
rideSchema.index({ "route.startCity": 1, "route.endCity": 1, status: 1 });

export default mongoose.model("Ride", rideSchema);