import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: [
    {
      url: String,
      public_id: String,
    },
  ],
});

const driverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
      index: true,
    },
    rcNo: {
      type: String,
      required: true,
    },
    rcImgs: [imageSchema],
    vehicleImgs: [imageSchema],
    vehicle: {
      type: {
        type: String,
        enum: ["SEDAN", "SUV", "HATCHBACK"],
        required: true,
      },
      vehicleNumber: {
        type: String,
        required: true,
      },
      ac: {
        type: String,
        enum: ["ac", "non-ac"],
        default: "ac",
        required: true,
      },
      seatingCapacity: {
        type: Number,
        min: 1,
        max: 8,
        required: true,
      },
      fuel: {
        type: String,
        enum: ["petrol", "diesel", "cng", "electric", "hybrid"],
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Driver", driverSchema);