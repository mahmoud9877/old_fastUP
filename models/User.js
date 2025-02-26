const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    DriverName: {
    type: String,
    required: true,
  },

  TruckNo: {
    type: String,
    required: true,
  },


  IDNo: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: String,
    default: "driver",
  },
  comment: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  shipments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Shipment" }], // Reference shipments
});

// Hash password before saving
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

module.exports = mongoose.model("User", UserSchema);
