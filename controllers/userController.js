import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Standard User Signup (No vehicle logic)
export const signup = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    const exists = await User.findOne({ $or: [{ email }, { phone }] });
    if (exists) return res.status(400).json({ message: "User already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ ...req.body, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ success: true, message: "Account created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Shared Login for both Users and Drivers
export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const credential = email || phone;

    if (!credential || !password) {
      return res.status(400).json({ message: "Please provide email or phone and password" });
    }

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