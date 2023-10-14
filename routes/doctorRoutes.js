const express = require("express");

const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
} = require("../controllers/doctorCtrl");

//post single doctor information
router.post("/getDoctorInfo", authMiddleware, getDoctorInfoController);

//post update profile
router.post("/updateProfile", authMiddleware, updateProfileController);

//POST GET single doc information
router.post("/getDoctorById", authMiddleware, getDoctorByIdController);

//Get appointments using its id
router.get(
  "/doctor-appointments",
  authMiddleware,
  doctorAppointmentsController
);

// appointment status controller
router.post("/update-status", authMiddleware, updateStatusController);


module.exports = router;
