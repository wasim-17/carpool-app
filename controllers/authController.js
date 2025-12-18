import User from "../models/User.js";
import Driver from "../models/Driver.js"; // Import Driver model
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
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

    // 4. Logic for "Drivers folder": If role is driver, save vehicle info in Driver model
    if (role === "driver") {
      const newDriver = new Driver({
        userId: savedUser._id, // Links the driver to the user
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

export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const credential = email || phone;

    if (!credential || !password) {
      return res.status(400).json({ message: "Please provide email or phone and password" });
    }

    // Search for user
    const user = await User.findOne({
      $or: [{ email: credential }, { phone: credential }]
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email/phone or password" });
    }

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      user: userData
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};