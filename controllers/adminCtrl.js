const doctorModel = require("../models/doctorModel.js");
const userModel = require("../models/userModels.js");

const getAllUsersController = async(req, res) => {
   try{
       const users = await userModel.find({});
       res.status(200).send({
          success : true,
          message : 'All users fetched successfully',
          data : users
       });

   }catch(error){
      console.log(error);
      res.status(500).send({
         success : false,
         message : 'Error in fetching all users',
         error
      })
   }
}

const getAllDoctorsController = async(req, res) => {
   try{
       const doctors = await doctorModel.find({});
       res.status(200).send({
         success : true,
         message : 'All doctors fetched successfully',
         data : doctors
       });
   }catch(error){
       console.log(error);
       res.status(500).send({
          success : false,
          message : 'Error in fetching all doctors',
          error
       })
   }
}

const changeAccountStatusController = async (req, res) => {
   try {
     const { doctorId, status } = req.body;
     const doctor = await doctorModel.findByIdAndUpdate(doctorId, { status });
     const user = await userModel.findOne({ userId : req.body.userId });
     const notification = user.notification;

     notification.push({
       type: "doctor-account-request-updated",
       message: `Your Doctor Account Request Has ${status} `,
       onClickPath: "/notification",
     });
     user.isDoctor = status === "approved" ? true : false;
     await user.save();
     res.status(201).send({
       success: true,
       message: "Account Status Updated",
       data: doctor,
     });
   } catch (error) {
     console.log(error);
     res.status(500).send({
       success: false,
       message: "Eror in Account Status",
       error,
     });
   }
 };
module.exports = {
   getAllUsersController,
   getAllDoctorsController,
   changeAccountStatusController
}