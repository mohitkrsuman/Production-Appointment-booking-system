const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel.js");
const userModel = require("../models/userModels.js");
const appointmentModel  = require("../models/appointmentModel.js");
const moment = require("moment");
//register callback
const registerController = async (req, res) => {
  try {
    const exisitingUser = await userModel.findOne({ email: req.body.email });
    if (exisitingUser) {
      return res
        .status(200)
        .send({ message: "User Already Exist", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(201).send({ message: "Register Sucessfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};

// login callback
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invlid EMail or Password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
  }
};

const authController = async (req, res) => {
  try {
    const user = await userModel.findById({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "auth error",
      success: false,
      error,
    });
  }
};

// Doctor Controller
const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = await doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();
    const adminUser = await userModel.findOne({ isAdmin: true });
    const notification = adminUser.notification;

    notification.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For A Doctor Account`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
        onClickPath: "/admin/doctors",
      },
    });

    await userModel.findByIdAndUpdate(adminUser._id, { notification });
    res.status(201).send({ 
      success: true,
      message: "Doctor Account Applied Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Applying For Doctor",
      error
    });
  }
};

// to get all notification
const getAllNotificationController = async(req, res) => {
  try{
      const user = await userModel.findOne({ _id : req.body.userId });
      const seenotification = user.seenotification;
      const notification = user.notification;

      seenotification.push(...notification);
      user.notification = [];
      user.seenotification = notification;

      const updatedUser = await user.save();

      res.status(200).send({
         success : true,
         message : 'All notifications marked as read',
         data : updatedUser
      });


  }catch(error){
     console.log(error);
     res.status(500).send({
       message : 'Error in notification controller',
       success : false,
       error
     });
  }
}

// delete all read notification
const deleteAllNotificationController = async(req, res) => {
    try{
       const user = await userModel.findOne({ _id : req.body.userId });
       user.notification = [];
       user.seenotification = [];

       const updatedUser = await user.save();
       updatedUser.password = undefined;
 
       res.status(200).send({
          success : true,
          message : 'All notifications deleted',
          data : updatedUser
       });
    } catch(error){
       console.log(error);
       res.status(500).send({
         message : 'Error in delete notification controller',
         success : false,
         error
       })
    }
}


// get all doctors
const getAllDoctorsController = async(req, res) => {
    try{
       const doctors = await doctorModel.find({status : 'approved'});
       res.status(200).send({
         success : true,
         message : 'Doctors List Fetched Successfully',
         data : doctors
       });
    }catch(error){
       console.log(error);
       res.status(500).send({
         success : false,
         message : 'Error in get all doctors controller',
         error
       });
    }
}

// *****************book appointment ***********

const bookAppointmentController = async(req, res) => {
    try{
       req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
       req.body.time = moment(req.body.time, "HH:mm").toISOString();
       req.body.status = "pending";
       const newAppointment = new appointmentModel(req.body);
       await newAppointment.save();

       const user = await userModel.findOne({ _id : req.body.doctorInfo.userId });
       user.notification.push({
         type : 'New-appointment-request',
         message : `You have a new appointment request from ${req.body.userInfo.name}`,
         onClickPath : '/user/appointments'
       });

       await user.save();
      
       res.status(200).send({
          success : true,
          message : 'Appointment Booked Successfully'
       });

    }catch(error){
       console.log(error);
       res.status(500).send({
          success : false,
          message : 'Error in appointment booking controller',
          error
       });
    }
}

// ******************booking availiability ***************
const bookingAvailiabilityController = async(req, res) => {
     try{
         const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
         const fromTime = moment(req.body.time, "HH:mm").subtract(1, 'hours').toISOString();
         const toTime = moment(req.body.time, "HH:mm").add(1, 'hours').toISOString();

         const doctorId = req.body.doctorId;
         const appointments = await appointmentModel.find({ doctorId, 
            date,
            time : {
               $gte : fromTime, 
               $lte : toTime
            }
         });

         if(appointments.length > 0){
            return res.status(200).send({
               message : 'Appointments not availiable at this time',
               success : true
            })
         }else{
            return res.status(200).send({
               success : true,
               message : 'Appointments availiable at this time'
            })
         }


     }catch(error){
         console.log(error);
         res.status(500).send({
            success : false,
            message : 'Error in booking availiability controller',
            error
         });
     }
}

const userAppointmentController = async(req, res) => {
   try{
      const appointments = await appointmentModel.find({ userId : req.body.userId });
      res.status(200).send({
         success : true,
         message : 'User appointment list fetched successfully',
         data : appointments,
      });
   }catch(error){
      console.log(error);
      res.status(500).send({
         success : false,
         message : 'Error in user appointment list controller',
         error
      })
   }
}

module.exports = {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDoctorsController,
  bookAppointmentController,
  bookingAvailiabilityController, 
  userAppointmentController
};
