const Shipment = require("../models/Shipment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ErrorHandler = require("../config/ErrorHandler");
const User = require("../models/User");

const upload = require("../config/imageconfigure"); // Import multer setup


exports.addShipment = async (req, res) => {
    try {
      const { TailNo, MissionTo, MissionFrom,userIds } = req.body;
      
      const exShipmeint=await Shipment.findOne({TailNo})
      if (exShipmeint) return res.status(400).json({ message: "Shipment already exists" });

      if (!userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ message: "userIds should be an array." });
      }
      const users = await User.find({ '_id': { $in: userIds } });
      if (users.length !== userIds.length) {
        return res.status(404).json({ message: "Some users were not found." });
      }
      const newShipment = new Shipment({
        MissionFrom,
        MissionTo,
        TailNo,
        user: users,  // Associate the users with this shipment
        statuses: [{ status: "البوابة فارغة", date: new Date() }], // Initial status
      });
  
      await newShipment.save();
      await User.updateMany(
        { _id: { $in: userIds } },
        { $push: { shipments: newShipment._id } }
      );
      res.status(201).json({ message: "shipment added successfully", shipments: newShipment });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  


//   exports.addShipment = async (req, res) => {
//     try {
//       const { MissionFrom, MissionTo, userIds } = req.body;
  
//       // Validate that userIds is provided and is an array
//       if (!userIds || !Array.isArray(userIds)) {
//         return res.status(400).json({ message: "userIds should be an array." });
//       }
  
//       // Iterate over the userIds array and check if each user exists. If not, create the user.
//       const users = [];
  
//       for (let userId of userIds) {
//         let user = await User.findById(userId);
//         if (!user) {
//           // If the user does not exist, create a new user
//           const newUser = new User({
//             _id: userId,  // Assigning the user ID (you can use other info here too, based on your logic)
//             // You can include other fields here as needed
//             phone: "Default Phone", // Example default field, customize it as needed
//             DriverName: "Default Driver", // Example default value, customize as needed
//             TruckNo: "Default Truck", // Example default value
//             IDNo: "Default ID", // Example default value
//           });
  
//           // Save the new user to the database
//           user = await newUser.save();
//         }
  
//         users.push(user); // Push the found or newly created user into the users array
//       }
  
//       // Create the shipment and associate the users with it
//       const newShipment = new Shipment({
//         MissionFrom,
//         MissionTo,
//         user: users,  // Associate the users with this shipment
//         statuses: [{ status: "البوابة فارغة", date: new Date() }], // Initial status
//       });
  
//       await newShipment.save();
  
//       res.status(201).json({ message: "Shipment created successfully.", shipment: newShipment });
//     } catch (error) {
//       res.status(500).json({ message: "Server Error", error });
//     }
//   };
  

  
exports.editShipment = async (req, res) => {
    // try {
    //   const { shipmentId } = req.params; // Shipment ID from the route params
    //   const {status } = req.body;
  
    //   // Find the shipment by ID
    //   const shipment = await Shipment.findById(shipmentId);
    //   if (!shipment) {
    //     return res.status(404).json({ message: "Shipment not found" });
    //   }
  
    //   // Update the shipment's policy image and policy status if provided
    //   if (policyImage) {
    //     shipment.policyImage = policyImage;
    //   }
    //   if (policyStatus) {
    //     shipment.policyStatus = policyStatus;
    //   }
  
    //   // If a new status is provided, add it to the shipment's statuses
    //   if (status) {
    //     const newStatus = {
    //       status,
    //       date: new Date(),
    //     };
    //     shipment.statuses.push(newStatus);
    //   }
  
    //   // Save the updated shipment
    //   await shipment.save();
  
    //   res.status(200).json({ message: "Shipment updated successfully", shipment });
    // } catch (error) {
    //   res.status(500).json({ message: "Server Error", error });
    // }
    try { 
        const { shipmentId } = req.params;  // Shipment ID from request params 
        const { status } = req.body;        // New status from request body 
        const userId = req.user.id;         // Logged-in user ID (from JWT token) 
     
        // Find the shipment by ID 
        const shipment = await Shipment.findById(shipmentId); 
        if (!shipment) { 
          return res.status(404).json({ message: "Shipment not found." }); 
        } 
     
        // Check if the logged-in user is associated with this shipment 
        if (!shipment.user.includes(userId)) { 
          return res.status(403).json({ message: "You are not authorized to update this shipment." }); 
        } 
     
        // Validate new status against allowed statuses 
        const shipmentStatuses = [ 
          "البوابة فارغة", 
          "بوابة الخروج كاملة", 
          "وصول نفق بورسعيد", 
          "الانطلاق من نفق بورسعيد", 
          "وصول العريش", 
          "مغادرة من العريش", 
          "ميدان الترابيح رفح", 
          "تفريغ البضائع في رفح", 
        ]; 
     
        if (!shipmentStatuses.includes(status)) { 
          return res.status(400).json({ message: "Invalid status update." }); 
        } 
     
        // Add new status update with a timestamp 
        shipment.statuses.push({ status, date: new Date() }); 
     
        await shipment.save(); 
     
        res.status(200).json({ message: "Shipment status updated successfully.", shipment }); 
      } catch (error) { 
        res.status(500).json({ message: "Server Error", error }); 
      } 
    
  };
  
  
  exports.getAllShipments = async (req, res) => {
    try {
      // Find all users who are marked as drivers (modify this condition as per your schema)
      const shipment = await Shipment.find(); // or adjust according to your schema
  
      if (shipment.length === 0) {
        return res.status(404).json({ message: "No shipment found." });
      }
  
      // Return the list of shipment
      res.status(200).json({ shipment });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };

  exports.searchShipments = async (req, res) => {
  let { query } = req.query; // Extract query from req.query

  console.log("Received Query:", query);

  try {
      let results;

      if (!query || query.trim() === "") {
          results = await Shipment.find({ isAdmin: "driver" });
              } else {
          query = String(query).trim(); // Ensure it's a string

          results = await User.find({
              $or: [
                  { TailNo: { $regex: new RegExp(query, "i") } },
                  { MissionFrom: { $regex: new RegExp(query, "i") } },
                  { MissionTo: { $regex: new RegExp(query, "i") } },
                  { status: { $regex: new RegExp(query, "i") } },
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
  // exports.searchShipments = async (req, res) => {
  //   try {
  //     const { TailNo, MissionFrom, MissionTo, status } = req.query;  // Using query params for search
  
  //     // Build the query object dynamically
  //     let query = {};
  
  //     if (TailNo) query.TailNo = { $regex: TailNo, $options: "i" }; // Case-insensitive search for TailNo
  //     if (MissionFrom) query.MissionFrom = { $regex: MissionFrom, $options: "i" }; // Case-insensitive search for MissionFrom
  //     if (MissionTo) query.MissionTo = { $regex: MissionTo, $options: "i" }; // Case-insensitive search for MissionTo
  //     if (status) query.statuses = { $elemMatch: { status: { $regex: status, $options: "i" } } }; // Case-insensitive search for status
  
  //     // Execute the query
  //     const shipments = await Shipment.find(query);
  
  //     if (shipments.length === 0) {
  //       return res.status(404).json({ message: "No shipments found matching the search criteria." });
  //     }
  
  //     // Send the results back
  //     res.status(200).json({ shipments });
  //   } catch (error) {
  //     res.status(500).json({ message: "Server Error", error });
  //   }
  // };
  exports.getShipmentId = async (req, res) => {
    try {
      const { shipmentId } = req.params; // Get driverId from the URL parameter
  
      // Find driver by ID in the database
      const shipment = await Shipment.findById(shipmentId);
  
      if (!shipment) {
        return res.status(404).json({ message: "shipment not found" });
      }
  
      // Send the shipment details in the response
      res.status(200).json({ shipment });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };
  


// New endpoint to upload image
exports.updatePolicyImage = async (req, res) => {
    const { shipmentId } = req.params;  // Get shipment ID from route params

        try {
            const shipment = await Shipment.findById(shipmentId);
    
            if (!shipment) {
              return res.status(404).json({ message: "Shipment not found." });
            }
 
            if (req.file && req.file.filename) {
                shipment.policyImage = `/uploads/${req.file.filename}`;  // Save the image path (or URL if using cloud storage)
              }
              shipment.policyStatus = "pending";  // This can be customized

              // Save the updated shipment
              await shipment.save();
          
              res.status(200).json({
                message: "Policy image updated successfully.",
                shipment,
              });



    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  
  exports.adminApproveRejectPolicyImage = async (req, res) => {
    const { shipmentId } = req.params;
    const { action } = req.body; // The action can be 'approve' or 'reject'
  
    // Check if action is valid
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Use 'approve' or 'reject'." });
    }
  
    try {
      // Find the shipment by ID
      const shipment = await Shipment.findById(shipmentId);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found." });
      }
  
      // Check if the policy image is still pending
      if (shipment.policyStatus !== "pending") {
        return res.status(400).json({ message: "The policy image has already been processed." });
      }
  
      // Update the policyStatus based on the action
      shipment.policyStatus = action === "approve" ? "approved" : "rejected";
  
      // Save the updated shipment
      await shipment.save();
  
      res.status(200).json({
        message: `Policy image has been ${action}d successfully.`,
        shipment,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };
  exports.addInspectionStatus = async (req, res) => {
    try {
      const { shipmentId } = req.params;
      const { status } = req.body;
  
      // Ensure only admin can perform this action
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Only admin can add inspection statuses." });
      }
  
      const shipment = await Shipment.findById(shipmentId);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found." });
      }
  
      // Ensure status is unique
      if (shipment.inspectionStatuses.includes(status)) {
        return res.status(400).json({ message: "Inspection status already exists." });
      }
  
      // Add status to inspectionStatuses array
      shipment.inspectionStatuses.push(status);
      await shipment.save();
  
      res.status(200).json({
        message: "Inspection status added successfully.",
        shipment,
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };
  
  // User: Update their own current inspection status
exports.updateUserInspectionStatus = async (req, res) => {
    try {
      const { shipmentId } = req.params;
      const { status } = req.body;
      const userId = req.user.id;
  
      const shipment = await Shipment.findById(shipmentId);
      if (!shipment) {
        return res.status(404).json({ message: "Shipment not found." });
      }
  
      // Ensure user is assigned to this shipment
      if (!shipment.user.includes(userId)) {
        return res.status(403).json({ message: "You are not authorized to update this shipment." });
      }
  
      // Validate that status exists in `inspectionStatuses`
      if (!shipment.inspectionStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid inspection status." });
      }
  
      // Add new current inspection status with today's date
      shipment.currentInspectionStatus.push({ status, date: new Date() });
  
      await shipment.save();
  
      res.status(200).json({
        message: "Current inspection status updated successfully.",
        shipment,
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error });
    }
  };
  