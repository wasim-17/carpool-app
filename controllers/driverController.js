import User from "../models/User.js";
import Driver from "../models/Driver.js";
import bcrypt from "bcryptjs";

// Specialized Driver Signup (Saves to two collections)
export const driverSignup = async (req, res) => {
  try {
    const { email, phone, password, role, vehicle, rcNo, rcImgs, vehicleImgs } = req.body;

    // 1. Check if user already exists
    const exists = await User.findOne({ $or: [{ email }, { phone }] });
    if (exists) return res.status(400).json({ message: "User already registered" });

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the User (Identity Collection)
    const newUser = new User({ 
      ...req.body, 
      password: hashedPassword 
    });
    const savedUser = await newUser.save();

    // 4. Save vehicle info in Driver model (Drivers folder in Compass)
    if (role === "driver") {
      const newDriver = new Driver({
        userId: savedUser._id, // Critical link
        rcNo,
        rcImgs,
        vehicleImgs,
        vehicle: {
          type: vehicle?.type,
          vehicleNumber: vehicle?.vehicleNumber,
          ac: vehicle?.ac,
          seatingCapacity: vehicle?.seatingCapacity,
          fuel: vehicle?.fuel,
        }
      });
      await newDriver.save();
    }

    res.status(201).json({ 
      success: true, 
      message: role === "driver" ? "Driver account and vehicle profile created" : "User account created" 
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};