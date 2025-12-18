export const validateSignup = (req, res, next) => {
  const { role, isVendorDriver, firstName, lastName, email, phone, password, aadhaar, licenseNo, rcNo } = req.body;

  // Basic info for everyone
  if (!firstName || !lastName || !email || !phone || !password) {
    return res.status(400).json({ message: "All basic fields are required" });
  }

  // Logic: Vendor Only
  if (role === "vendor" && !isVendorDriver) {
    if (!aadhaar) return res.status(400).json({ message: "Vendors must provide Aadhaar number" });
  }

  // Logic: Driver or Vendor acting as Driver
  const isDriving = role === "driver" || (role === "vendor" && isVendorDriver === true);
  if (isDriving) {
    if (!aadhaar || !licenseNo || !rcNo) {
      return res.status(400).json({ message: "Aadhaar, License, and RC are required for this role" });
    }
  }

  next();
};

