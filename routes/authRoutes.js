const express = require("express");
const {  login,addDriver, changePassword, editProfile, getAllDrivers, deleteUser, searchDrivers, getDriverById, updateUser } = require("../controllers/authController");
const { authorizeRoles } = require("../middleware/authMiddleware");
const {isAuthenticated} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/add_driver", isAuthenticated, authorizeRoles('admin'), addDriver);
router.post("/change_password", isAuthenticated, changePassword);
router.post("/edit_profile", isAuthenticated, editProfile);
router.get("/all_drivers", getAllDrivers);
router.delete("/delete_user/:userId", isAuthenticated, authorizeRoles('admin'), deleteUser);
router.get("/search", searchDrivers);
router.get("/driver/:driverId", getDriverById);
router.put("/update/:userId",isAuthenticated, authorizeRoles('admin'), updateUser); // Protect route


module.exports = router;
