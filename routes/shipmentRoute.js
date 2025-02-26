const express = require("express");
const {   changePassword, editProfile, getAllDrivers, deleteUser, searchDrivers, getDriverById } = require("../controllers/authController");
const { authorizeRoles } = require("../middleware/authMiddleware");
const {isAuthenticated} = require("../middleware/authMiddleware");
const { addShipment, editShipment, getAllShipments, searchShipments, getShipmentId, updatePolicyImage, adminApproveRejectPolicyImage, updateUserInspectionStatus, addInspectionStatus } = require("../controllers/shipmentController");
const upload = require("../config/imageconfigure");

const router = express.Router();

router.post("/add_shipment", isAuthenticated, authorizeRoles('admin'), addShipment);
router.put("/edit_Shipment/:shipmentId", isAuthenticated, editShipment);
router.get("/all_shipments", getAllShipments);
router.get("/search_shipments", searchShipments);  // Use query params for search
router.get("/shipment/:shipmentId", getShipmentId);
router.put("/addPolicy/:shipmentId", upload.single("policyImage"),isAuthenticated, updatePolicyImage);
router.put("/shipment/:shipmentId/approve-reject-policy-image", adminApproveRejectPolicyImage);
router.put("/shipment/:shipmentId/inspection/admin", isAuthenticated, authorizeRoles("admin"), addInspectionStatus);

// User updates their current inspection status
router.put("/shipment/:shipmentId/inspection", isAuthenticated, authorizeRoles("driver"),updateUserInspectionStatus);

module.exports = router;
