const appointmentModel = require("../models/appointmentModel.js");
const doctorModel = require("../models/doctorModel.js");
const userModel = require("../models/userModels.js");
// const userModel = require("../models/userModels.js");

//Get single doctor information
const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "Doctor data fetched successfully",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get single doctor infor controller",
      error,
    });
  }
};

// update controller
const updateProfileController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.body.userId },
      req.body
    );
    res.status(200).send({
      success: true,
      message: "Doctor Profile Updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update profile controller",
      error,
    });
  }
};

const getDoctorByIdController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ _id: req.body.doctorId });
    res.status(200).send({
      success: true,
      message: "Single Doctor data fetched successfully",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in doctor by id controller",
      error,
    });
  }
};

const doctorAppointmentsController = async (req, res) => {
   try{
       const doctor = await doctorModel.findOne({ userId : req.body.userId });
       const appointments = await appointmentModel.find({ doctorId : doctor._id });

       res.status(200).send({
          success : true,
          message : 'Doctor appointments fetched successfully',
          data : appointments
       })
   }catch(error){
       console.log(error);
       res.status(500).send({
          succes : false,
          message : 'Error in doctor appointment controller',
          error
       });
   }
};

const updateStatusController = async(req, res) => {
   try{
      const { appointmentId , status} = req.body;
      const appointments = await appointmentModel.findByIdAndUpdate(appointmentId, { status : status });

      const user = await userModel.findOne({ _id : appointments.userId });
      const notification = user.notification;
      notification.push({
        type : 'status-appointment',
        message : `You appointment has been updated to ${status}`,
        onClickPath : '/doctor-appointments'
      });

      await user.save();

      res.status(200).send({
         success : true,
         message : 'Appointment status updated successfully',
         data : appointments
      })

   }catch(error){
       console.log(error);
       res.status(500).send({
          success : false,
          message : 'Error in update status controller',
          error
       });
   }
}

module.exports = {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController
};
