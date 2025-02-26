const mongoose = require("mongoose");

const shipmentStatuses = [
  "البوابة فارغة",
  "بوابة الخروج كاملة",
  "وصول نفق بورسعيد",
  "الانطلاق من نفق بورسعيد",
  "وصول العريش",
  "مغادرة من العريش",
  "ميدان الترابيح رفح",
  "تفريغ البضائع في رفح",
]

const shipmentSchema = new mongoose.Schema({
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],

  statuses: [
    {
      status: { 
        type: String, 
        enum: shipmentStatuses
      },
      date: { type: Date, default: Date.now },
    }
  ],
  
  policyImage: { type: String }, 
  policyStatus: {
    type: String,
    enum: ["empty","pending", "approved", "rejected"],
    default: "empty",
  }, // New field to track admin approval
  inspectionStatuses: [{ type: String }],

  // Users update their current inspection status
  currentInspectionStatus: [
    {
      status: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  MissionFrom: { type: String, required: true },
  MissionTo: { type: String, required: true },
 Tailcurrentstatus: { type: String },
  TailNo: { type: String},
});

// ✅ Add method to move to next status
shipmentSchema.methods.moveToNextStatus = async function () {
  const currentStatus = this.statuses[this.statuses.length - 1].status;
  const currentIndex = shipmentStatuses.indexOf(currentStatus);

  if (currentIndex === -1 || currentIndex === shipmentStatuses.length - 1) {
    throw new Error("No further status available");
  }

  // Move to the next status
  const nextStatus = shipmentStatuses[currentIndex + 1];
  this.statuses.push({ status: nextStatus, date: new Date() });

  await this.save();
  return nextStatus;
};

shipmentSchema.pre("save", function (next) {
  if (this.isNew) {
      this.statuses = [{ status:"البوابة فارغة",date: new Date() }];
  }
  next();
});

const Shipment = mongoose.model("Shipment", shipmentSchema);
module.exports = Shipment;  // ✅ Ensure correct export




