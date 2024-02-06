const bcrypt = require("bcrypt");
const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();
const { UserModel } = require("../Models/UserModel");
const { userAuth } = require("../middleware/userDetails");
const jwt = require("jsonwebtoken");
const { use } = require("./employeeRouter");

let NEWEMPID = 150;

const authRouter = express.Router();

authRouter.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    const html = `<h1>Forgot password?</h1>
  <p><a href=https://hr-dashboard-app.netlify.app/resetPass/${user._id}>Click here</a> to reset your password.</p>
  
  `;

    if (!user) {
      return res
        .status(401)
        .json({ msg: "No user found with this email address" });
    }

    // setting up the transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
    });

    // Compose the email
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: "Password Reset Request",
      html: html,
    };

    // Send the email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res
          .status(500)
          .send({ message: "Error sending email", err: err.message });
      }

      return res.status(200).send({ message: "Password reset email sent" });
    });
  } catch (error) {
    res.status(401).json({ msg: "No user found with this email address" });
  }
});

authRouter.post("/resetPassword/:id", async (req, res) => {
  // console.log(req.body, req.params);
  const { password } = req.body;
  const { id } = req.params;

  try {
    bcrypt.hash(password, 5, async (err, hash) => {
      if (err) {
        return res.status(400).json({ msg: err.message + "BCRYPT" });
      }
      const user = await UserModel.findByIdAndUpdate(
        { _id: id },
        { password: hash, confirmPassword: hash }
      );

      const findUser = await UserModel.findById({ _id: id });

      res.json({ msg: findUser });
    });
  } catch (error) {
    res.status(400).json({ msg: "Something went wrong. Please try again!!" });
  }
});

// authRouter.route("/signup").post(userSign);
authRouter.route("/login").post(userLogin);

authRouter.post("/signup", userAuth, async (req, res) => {
  // console.log(req.body, "data recieved");
  const { email } = req.body;

  const user = await UserModel.findOne({ email });

  if (user) {
    res.statusMessage = "Please Login.";
    return res.json({ msg: "User Already Exists!. Please Login." });
  }

  // console.log(req.body);
  try {
    bcrypt.hash(req.body.password, 5, async (err, hash) => {
      let data = req.body;
      let count = await UserModel.countDocuments();
      data.id = NEWEMPID + count;
      let newUser = new UserModel({
        ...data,
        password: hash,
        confirmPassword: hash,
      });
      await newUser.save();
      res.statusMessage = "Success";
      res.json({ newUser, msg: "Success" });
    });
  } catch (error) {
    let msg = { msg: error.message };
    if (error.message.includes("duplicate")) {
      msg.msg = "user already exists!!";
    }

    res.status(400).json(msg);
  }
});

// async function userSign(req, res) {
//   console.log(req.body, "data recieved");
//   try {
//     let data = req.body;
//     data.id = ++NEWEMPID;

//     // console.log("new User ---> ", data);

//     // let newUser = await UserModel.create(data);
//     let newUser = new UserModel(data);
//     await newUser.save();
//     // console.log(newUser);
//     // res.end("Data has came");
//     res.json(newUser);
//   } catch (error) {
//     console.log({ error: error.message }, "HERE");
//     res.status(400).json({ msg: error.message });
//   }
// }

async function userLogin(req, res) {
  try {
    let data = req.body;
    let user = await UserModel.findOne({ email: data.email });
    if (user) {
      bcrypt.compare(data.password, user.password, async (err, result) => {
        if (result) {
          const tokenPayload = {
            userName: user.firstName + " " + user.lastName,
            userID: user._id,
          };
          if (user.employeeType == 1) {
            tokenPayload.role = "admin";
          }
          const token = jwt.sign(tokenPayload, process.env.secreteKey);

          return res.json({ user, token });
        } else {
          return res.json({
            errorMessage: "Invaild User Credentials",
            // userpass: user.password,
            // datapass: data.password,
          });
        }
      });
      // if (user.password == data.password) {
      //   return res.json(user);
      // } else {
      //   return res.json({
      //     errorMessage: "Invaild User Credentials",
      //     userpass: user.password,
      //     datapass: data.password,
      //   });
      // }
    } else {
      return res.json({
        errorMessage: "User not found",
      });
    }
  } catch (err) {
    return res.json({
      errorMessage: err,
    });
  }
}

module.exports = authRouter;
