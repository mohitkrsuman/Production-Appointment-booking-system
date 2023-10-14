const express = require('express');

const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { getAllUsersController, getAllDoctorsController, changeAccountStatusController } = require('../controllers/adminCtrl');
 

// get method || users
router.get('/getAllUsers', authMiddleware, getAllUsersController);

//get method // doctors
router.get('/getAllDoctors', authMiddleware, getAllDoctorsController);

//POST method || account status update
router.post('/changeAccountStatus', authMiddleware, changeAccountStatusController)

module.exports = router;