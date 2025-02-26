const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../config/ErrorHandler");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    if (password !== user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   return res.status(400).json({ message: "Invalid credentials" });
    // }

    // Generate token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.addDriver = async (req, res) => {
  try {
    const { DriverName, TruckNo, IDNo, password, phone, comment } = req.body;

    const newDriver = new User({
      DriverName,
      TruckNo,
      IDNo,
      password,
      phone,
      comment,
    });

    await newDriver.save();
    res
      .status(201)
      .json({ message: "Driver added successfully", driver: newDriver });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  // Validate input
  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("Old and new passwords are required.", 400));
  }

  // Find the user by ID
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  // Compare the old password with the hashed password in the database
  if (oldPassword !== user.password) {
    return next(new ErrorHandler("Old password is incorrect.", 401));
  }
  //     const isMatch = await bcrypt.compare(oldPassword, user.password);
  //     if (!isMatch) {
  //       return next(new ErrorHandler("Old password is incorrect.", 401));
  //     }

  //     // Hash the new password and update the user's password
  //     const salt = await bcrypt.genSalt(10);
  //     const hashedPassword = await bcrypt.hash(newPassword, salt);

  //     // Update the user's password in the database
  user.password = newPassword;
  // console.log(hashedPassword);

  await user.save();

  res.status(200).json({
    message: "Password changed successfully.",
  });
};

exports.editProfile = async (req, res, next) => {
  const { DriverName, TruckNo, IDNo, phone } = req.body;

  // Find the user by ID
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  // Update user profile fields
  if (DriverName) user.DriverName = DriverName;
  if (TruckNo) user.TruckNo = TruckNo;
  if (phone) user.phone = phone;
  if (IDNo) user.IDNo = IDNo;
  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET
  );

  await user.save();

  res.json({ token, user });

  res.status(200).json({
    message: "Profile updated successfully.",
    data: {
      user,
      token,
    },
  });
};

exports.getAllDrivers = async (req, res) => {
  try {
    // Find all users who are marked as drivers (modify this condition as per your schema)
    const drivers = await User.find().populate("shipments"); // or adjust according to your schema

    if (drivers.length === 0) {
      return res.status(404).json({ message: "No drivers found." });
    }

    // Return the list of drivers
    res.status(200).json({ drivers });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
// exports.deleteUser = async (req, res, next) => {
//   try {
//     // Ensure the user is authenticated (you can customize authorization based on your needs)
//     const userId = req.params.id; // Get user ID from URL parameter

//     // Find the user by ID and delete
//     const user = await User.findByIdAndDelete(userId);

//     // If user is not found, return an error
//     if (!user) {
//       return next(new ErrorHandler("User not found", 404));
//     }

//     // Send success response
//     res.status(200).json({ message: "User deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error });
//   }
// };
// exports.searchDrivers = async (req, res, next) => {
//   let { query } = req.query; // Extract query from req.query (NOT req)
//   const results=null
//   if (!query || query.trim() === "") {
//     return results = await User.find();

//   }

//   query = String(query).trim(); // Ensure it's a string

//   try {
//      results = await User.find({
//       $or: [
//         { DriverName: { $regex: new RegExp(query, "i") } }, // Case-insensitive regex search
//         { TruckNo: { $regex: new RegExp(query, "i") } },
//         { IDNo: { $regex: new RegExp(query, "i") } },
//         { phone: { $regex: new RegExp(query, "i") } }, // Use regex for phone to prevent type issues
//       ],
//     });

//     res.json(results);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error });
//   }
// };

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params; // Get user ID from request params
    const adminId = req.user?.id; // Get admin ID from token (Middleware must set req.user)

    console.log(`Admin (${adminId}) attempting to delete User (${userId})`);

    // Ensure user exists
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admins from deleting themselves
    if (user._id.toString() === adminId) {
      return res
        .status(403)
        .json({ message: "Admins cannot delete themselves." });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.searchDrivers = async (req, res, next) => {
  let { query } = req.query; // Extract query from req.query

  console.log("Received Query:", query);

  try {
    let results;

    if (!query || query.trim() === "") {
      results = await User.find({ isAdmin: "driver" });
    } else {
      query = String(query).trim(); // Ensure it's a string

      results = await User.find({
        $or: [
          { DriverName: { $regex: new RegExp(query, "i") } },
          { TruckNo: { $regex: new RegExp(query, "i") } },
          { IDNo: { $regex: new RegExp(query, "i") } },
          { phone: { $regex: new RegExp(query, "i") } },
        ],
      });

      if (results.length === 0) {
        console.log("No matching users found, returning all users.");
        results = await User.find();
      }
    }

    res.status(200).json(results);
  } catch (error) {
    console.error("Search error:", error); // Log detailed error
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getDriverById = async (req, res) => {
  try {
    const { driverId } = req.params; // Get driverId from the URL parameter

    // Find driver by ID in the database
    const driver = await User.findById(driverId);

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    // Send the driver details in the response
    res.status(200).json({ driver });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params; // Get user ID from URL params
    const { DriverName, TruckNo, IDNo, phone, isAdmin } = req.body; // Get fields to update
    const adminId = req.user?.id; // Get admin ID from token (Middleware must set req.user)

    console.log(`Admin (${adminId}) updating User (${userId})`);

    // Ensure user exists
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent self-editing admin status
    if (
      user.isAdmin &&
      isAdmin !== undefined &&
      req.user.id === user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Admins cannot change their own admin status." });
    }

    // Update user fields (Only update if new values exist)
    user.DriverName = DriverName || user.DriverName;
    user.TruckNo = TruckNo || user.TruckNo;
    user.IDNo = IDNo || user.IDNo;
    user.phone = phone || user.phone;

    if (isAdmin !== undefined) {
      user.isAdmin = isAdmin; // Allow admin to change role
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
