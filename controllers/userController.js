import {
  UserModel,
  AddUserJobModel,
  AddVendorJobModel,
} from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { emailRegix } from "../config/constants.js";
import upload from "../multerConfig.js";
import nodemailer from "nodemailer";

class UserController {
  static userRegistration = async (req, res) => {
    // const profileImage = req.file ? req.file.filename : "";

    const { name, email, password, password_confirmation, tc, type, payment, profileImage } = req.body;

    console.log("user registration==>", req);

    const user = await UserModel.findOne({ email: email });
    if (user) {
      res.send({ status: false, message: "Email already exists" });
    } else {
      if (
        name &&
        email &&
        password &&
        password_confirmation &&
        tc &&
        type &&
        profileImage
      ) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const doc = new UserModel({
              name: name,
              email: email,
              password: hashPassword,
              password_confirmation: hashPassword,
              tc: tc,
              type: type,
              payment: payment,
              profileImage: profileImage,
            });
            await doc.save();
            const saved_user = await UserModel.findOne({ email: email });
            // Generate JWT Token
            const token = jwt.sign(
              { userID: saved_user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res
              .status(201)
              .send({
                status: true,
                message: "Registration Success",
                token: token,
              });
          } catch (error) {
            console.log(error);
            res.send({ status: false, message: "Unable to Register" });
          }
        } else {
          res.send({
            status: false,
            message: "Password and Confirm Password doesn't match",
          });
        }
      }
      else {
        res.send({ status: false, message: "All fields are requireds" });
      }
    }
  };

  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await UserModel.findOne({ email: email });
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch) {
            // Generate JWT Token
            const token = jwt.sign(
              { userID: user._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res.send({
              status: true,
              message: "Login Success",
              token: token,
              usertype: user.type,
              profileImage: user?.profileImage,
              id: user?.id,
              name: user?.name,
              email: user?.email,
            });
          } else {
            res.send({
              status: false,
              message: "Email or Password is not Valid",
            });
          }
        } else {
          res.send({ status: false, message: "You are not a Registered User" });
        }
      } else {
        res.send({ status: false, message: "All Fields are Required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: false, message: "Unable to Login" });
    }
  };

  static sendOtp = async (req, res) => {
    try {
      let OTP = Math.floor(100000 + Math.random() * 900000);

      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email error' });
      }

      const mailOptions = {
        from: "anastobe968@gmail.com",
        to: email,
        subject: "Otp Send By Solar",
        text: `Your OTP is : ${OTP}`,
      };
      let transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "anastobe968@gmail.com",
          pass: "paqxuiskbmszhvea",
        },
      });
      transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        }
      });

      return res
        .status(200)
        .cookie({ token: OTP })
        .send({ status: true, message: "Otp send successfully" });
    } catch (error) {
      res.send({ status: false, message: "Unable to send OTP" });
    }
  };

  static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({
          status: "failed",
          message: "New Password and Confirm New Password doesn't match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await UserModel.findByIdAndUpdate(req.user._id, {
          $set: { password: newHashPassword },
        });
        res.send({
          status: "success",
          message: "Password changed succesfully",
        });
      }
    } else {
      res.send({ status: "failed", message: "All Fields are Required" });
    }
  };

  // static upDateProfile = async (req, res) => {
  //   const { id, name, email } = req.body
  //   if (!emailRegix.test(email)) {
  //     res.send({ "status": "failed", "message": "invalid email" })
  //     return
  //   }
  //   else if (name.length < 4) {
  //     res.send({ "status": "failed", "message": "name must be 4 digit character long" })
  //     return
  //   }
  //   else {
  //     try {
  //       UserModel.updateOne({ id: id, name: name, email: email})
  //       res.send({ "status": true, "message": "Changed succesfully" })
  //     } catch (error) {
  //         res.status(400).send(error)
  //     }

  //   }
  // }

  static upDateProfile = async (req, res) => {
    console.log("========>", req);

    const { name, email, id } = req.body;
    if (!emailRegix.test(email)) {
      res.send({ status: "failed", message: "invalid email" });
      return;
    } else if (name.length < 4) {
      res.send({
        status: "failed",
        message: "name must be 4 digit character long",
      });
      return;
    } else {
      try {
        // const userId = req.params.userId;
        const updatedUserData = req.body;

        // Find the user by ID and update
        const updatedUser = await UserModel.findByIdAndUpdate(
          id,
          updatedUserData,
          {
            new: true, // Returns the updated document
          }
        );

        if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
        }

        res.send({
          status: true,
          message: "Profile Updated Successfully",
          updatedUser: updatedUser,
        });
        return;
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
      }
    }
  };

  static loggedUser = async (req, res) => {
    res.send({ user: req.user, status: true });
  };

  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    if (email) {
      const user = await UserModel.findOne({ email: email });
      if (user) {

        const OTP = otpGenerator.generate(6, {
          digits: true,
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
        const mailOptions = {
          from: "anastobe968@gmail.com",
          to: req.body.email,
          subject: "Otp Send By SAAB",
          text: `Your OTP is : ${OTP}`,
        };
        let transport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "anastobe968@gmail.com",
            pass: "otwduudpsiaonjaz",
          },
        });
        transport.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          }
        });
        const otp = new Otp({
          email: req.body.email,
          otp: OTP,
        });
        const result = await otp.save();
        return res
          .status(200)
          .cookie({ token: OTP })
          .send({ status: true, message: "Otp send successfully" });

        console.log("after saving===>", result);

        // res.send({
        //   status: "success",
        //   message: "Password Reset Email Sent... Please Check Your Email",
        // });
      } else {
        res.send({ status: "failed", message: "Email doesn't exists" });
      }
    } else {
      res.send({ status: "failed", message: "Email Field is Required" });
    }
  };

  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    const user = await UserModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
      jwt.verify(token, new_secret);
      if (password && password_confirmation) {
        if (password !== password_confirmation) {
          res.send({
            status: "failed",
            message: "New Password and Confirm New Password doesn't match",
          });
        } else {
          const salt = await bcrypt.genSalt(10);
          const newHashPassword = await bcrypt.hash(password, salt);
          await UserModel.findByIdAndUpdate(user._id, {
            $set: { password: newHashPassword },
          });
          res.send({
            status: "success",
            message: "Password Reset Successfully",
          });
        }
      } else {
        res.send({ status: "failed", message: "All Fields are Required" });
      }
    } catch (error) {
      console.log(error);
      res.send({ status: "failed", message: "Invalid Token" });
    }
  };

  //user
  static allVendors = async (req, res) => {
    // res.send({ "user": req.user })

    try {
      const vendors = await UserModel.find();

      res.send({ users: vendors, status: true });

      // // Connect to the MongoDB database
      // const client = await MongoClient.connect(mongoUrl);
      // const db = client.db(dbName);

      // // Fetch all users from the 'user' collection
      // const users = await db.collection(collectionName).find().toArray();

      // console.log("----",users);

      // // Close the MongoDB connection
      // client.close();

      // // Return the users as a response
      // res.json(users);
    } catch (err) {
      // Handle errors
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Failed to fetch users", status: false });
    }
  };

  static userAddJob = async (req, res) => {
    const {
      userImg,
      name,
      title,
      firebase_id,
      description,
      List
    } = req.body;

    console.log("req=====",req.body);

    if (
      userImg &&
      name &&
      title &&
      firebase_id &&
      description &&
      List
    ) {
      try {
        const doc = new AddUserJobModel({
          userImg: userImg,
          name: name,
          title: title,
          firebase_id: firebase_id,
          description: description,
          List: List
        });

        await doc.save();
        res
          .status(200)
          .send({ status: true, message: "Your Job Added SuccessFully" });
      } catch (error) {
        console.log(error);
        res.send({ status: false, message: "Unable to Register" });
      }
    } else {
      res.send({ status: false, message: "All fields are requireds" });
    }
  };

  static viewVendorsJobs = async (req, res) => {
    try {
      const vendorJobs = await AddVendorJobModel.find();

      res.send({ vendorJobs: vendorJobs, status: true });
    } catch (err) {
      // Handle errors
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Failed to fetch users", status: false  });
    }
  };

  //vendors
  static viewUserJobs = async (req, res) => {
    // res.send({ "user": req.user })

    try {
      const userJobs = await AddUserJobModel.find();

      res.send({ userJobs: userJobs, status: true });
    } catch (err) {
      // Handle errors
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Failed to fetch users", status: false });
    }
  };

  static vendorAddJob = async (req, res) => {

    const { userImg, name, title,  firebase_id, description, 
      noofpanels,
      battery,
      price,
      area,
      extraExpense,
      ttklWatts,
      daysForInstalation
    } = req.body;

    console.log("vendorAddJob==>",req.body);

    if ( userImg, name, title, firebase_id, description, noofpanels, battery, price, area, extraExpense, ttklWatts, daysForInstalation) {
      try {
        console.log("try pylay",req);
        const doc = new AddVendorJobModel({
          userImg: userImg,
          name: name,
          title: title,
          firebase_id: firebase_id,
          description: description,
          packageList: {
          noofpanels: noofpanels,
          battery: battery,
          price: price,
          area: area,
          extraExpense: extraExpense,
          ttklWatts: ttklWatts,
          daysForInstalation: daysForInstalation
        }
        });


        await doc.save();
        res
          .status(200)
          .send({ status: "success", message: "Your Job Added SuccessFully" });
      } catch (error) {
        console.log(error);
        res.send({ status: false, message: "Unable to Add Job" });
      }
    } else {
      res.send({ status: false, message: "All fields are requireds" });
    }
  };

  
  static payment = async (req, res) => {

    const user_id = req.params.user_id;
    const payment = req.body.payment;

    console.log("this user_id==>",user_id,"==payment==",payment);

    if ( user_id ) {
    
      try {
        // Find the user by their ID

        await UserModel.findByIdAndUpdate(user_id, {
          $set: { payment: true },
        });
        return res.status(200).json({ message: 'Payment successfully', status: true });
    
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error', status: true  });
      }

    } else {
      res.send({ status: false, message: "User Id Is Missing" });
    }
  };

  //checking
  static check = async (req, res) => {
    // res.send({ "user": req.user })

    try {
      res.send("checking ok");

    } catch (err) {
      // Handle errors
      console.error("Error fetching users:", err);

    }
  };

}

export default UserController