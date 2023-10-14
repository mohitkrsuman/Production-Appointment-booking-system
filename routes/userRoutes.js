const express = require("express");
const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController,
  bookAppointmentController,
  bookingAvailiabilityController,
  userAppointmentController,
} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

//router onject
const router = express.Router();

//routes
//LOGIN || POST
router.post("/login", loginController);

//REGISTER || POST
router.post("/register", registerController);

//Auth || POST
router.post("/getUserData", authMiddleware, authController);


//Apply Doctor - POST
router.post("/apply-doctor", authMiddleware, applyDoctorController);

// notifications
router.post("/get-all-notification", authMiddleware, getAllNotificationController);

//delete all read notification
router.post("/delete-all-notification", authMiddleware, deleteAllNotificationController);

// get all doc
router.get("/getAllDoctors", authMiddleware, getAllDoctorsController);

//book appointment
router.post("/book-appointment", authMiddleware, bookAppointmentController);

//booking availiability 
router.post("/booking-availiability", authMiddleware, bookingAvailiabilityController);

// appointment list
router.get("/user-appointments", authMiddleware, userAppointmentController);


module.exports = router;
