import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: [
    {
      url: String,
      public_id: String,
    },
  ],
});

// Validation helpers
const needsDrivingDocs = function () {
  return this.role === "driver" || (this.role === "vendor" && this.isVendorDriver === true);
};

const needsIdentityDocs = function () {
  return this.role === "driver" || this.role === "vendor";
};

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "driver", "vendor"],
      default: "user",
    },
    isVendorDriver: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    dob: { 
      type: Date, 
      required: [needsIdentityDocs, "Date of birth is required"] 
    },
    aadhaar: {
      type: String,
      required: [needsIdentityDocs, "Aadhaar number is required"]
    },
    aadhaarImgs: [imageSchema],
    licenseNo: {
      type: String,
      required: [needsDrivingDocs, "Driving license is required"]
    },
    licenseImgs: [imageSchema],
    
    // Profile Images
    riderImg: [imageSchema],
    driverImg: [imageSchema],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;