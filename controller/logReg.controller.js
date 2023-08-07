const userModel = require("../model/logreg.model");
const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
const jwt = require("jsonwebtoken");
const mailer = require("../helper/mailer");

class loginRegisterController {
  //<<<<<<<<<<<<<<<<<<<<<  authentication part >>>>>>>>>>>>>>>>>>>>>>>>>>>>

  async userAuth(req, res, next) {
    try {
      if (!_.isEmpty(req.user)) {
        next();
      } else {
        res.json({
          message: "UnAuthorized User  Please Login",
          status: 200,
          data: [],
        });
      }
    } catch (err) {
      throw err;
    }
  }
  //<<<<<<<<<<<<<<<<<<<<<<< show welcome status >>>>>>>>>>>>>>>>>>>>>>>>

  async welcomeStatus(req, res) {
    try {
      res.json({
        message: "welcome",
        status: 200,
        data: [],
      });
    } catch (err) {
      throw err;
    }
  }
  //  <<<<<<<<<<<<<< user Register >>>>>>>>>>>>>>>>>>

  async register(req, res) {
    try {
      if (_.isEmpty(req.body.firstname)) {
        return res.json({
          status: 400,
          message: "firstname is required",
          data: [],
        });
      }

      if (_.isEmpty(req.body.lastname)) {
        return res.json({
          message: "lastname is required",
          status: 400,
          data: [],
        });
      }

      if (_.isEmpty(req.body.email)) {
        return res.json({
          message: "Email is Required",
          status: 400,
          data: [],
        });
      }

      if (_.isEmpty(req.body.password)) {
        return res.json({
          message: "password is Required",
          status: 400,
          data: [],
        });
      }

      if (_.isEmpty(req.body.confirm_password)) {
        return res.json({
          message: "confirm password is Required",
          status: 400,
          data: [],
        });
      }

      let is_email_exist = await userModel.findOne({
        email: req.body.email,
      });

      if (!_.isEmpty(is_email_exist)) {
        return res.json({
          message: " this email is already exist ",
          status: 400,
          data: [],
        });
      }

      if (req.body.password !== req.body.confirm_password) {
        return res.json({
          message: "password and confirm password is does not matching ",
          status: 400,
          data: [],
        });
      }
      req.body.fullname = req.body.firstname + " " + req.body.lastname;

      req.body.password = bcrypt.hashSync(
        req.body.password,
        bcrypt.genSaltSync(10)
      );

      const otpGenerated = `OTP-${Math.round(Math.random() * 10000)}`;
      req.body.otp = otpGenerated;
      const currentTime = dayjs().unix();
      // console.log(currentTime);

      req.body.otpExpiryTime = currentTime;
      const dateTimeObject = new Date();
      await mailer.sendMail(
        process.env.EMAIL,
        req.body.email,
        "Succesfully Registered",
        `hiw ${
          req.body.fullname
        } your account has been registered, <br> Date :${dateTimeObject.toDateString()} <br> Time : ${dateTimeObject.toTimeString()}<br> use this otp to varify your gmail ${otpGenerated} <br> this otp is valid for 1 minute `
      );

      let saveData = await userModel.create(req.body);
      if (!_.isEmpty(saveData) && saveData._id) {
        res.json({
          message: " Your registration has been sucessfully completed ",
          status:400,
          data: saveData,
        });
      } else {
        res.json({
          message: " something went wrong ",
          status:400,
          data: [],
        });
      }
    } catch (err) {
      throw err;
    }
  }
  // <<<<<<<<<<<<<<<< user login >>>>>>>>>>>>>>>>
  async login(req, res) {
    try {
      if (_.isEmpty(req.body.email)) {
        return res.json({
          message: "Email is required",
          status:400,
          data: [],
        });
      }
      if (_.isEmpty(req.body.password)) {
        return res.json({
          message: "password is required",
          status:400,
          data: [],
        });
      }

      let email_exist = await userModel.findOne({
        email: req.body.email,
      });

      if (_.isEmpty(email_exist)) {
        res.json({
          message: "email does not exist with this account",
          status:400,
          data: [],
        });
      } else if (email_exist.isEmailVerified !== true) {
        res.json({
          message: "Email is not verified ",
          status:400,
          data: [],
        });
      } else {
        const hash_password = email_exist.password;
        if (bcrypt.compareSync(req.body.password, hash_password)) {
          let token = jwt.sign(
            {
              id: email_exist._id,
            },
            "abcdefg",
            {
              expiresIn: "2d",
            }
          );
          res.cookie("user_token", token);
          res.json({
            message: "Login sucessfull",
            status:200,
            token: token,
          });
        } else {
          res.json({
            message: "Bad credentials",
            status:401,
            data: [],
          });
        }
      }
    } catch (err) {
      throw err;
    }
  }

  //  <<<<<<<<<<<<<<< async varify otp >>>>>>>>>>>>>>

  async varifyOtp(req, res) {
    try {
      if (_.isEmpty(req.body.email)) {
        return res.status(400).json({
          message: "Email is required",
          data: [],
        });
      }

      let email_exist = await userModel.findOne({
        email: req.body.email,
      });

      if (_.isEmpty(email_exist)) {
        res.status(400).json({
          message: " this email does not exist with this email ",
          data: [],
        });
      }

      if (_.isEmpty(req.body.otp)) {
        res.json({
          message: " OTP is required ",
          status:400,
          data: [],
        });
      }

      let otp_exist = await userModel.findOne({
        otp: req.body.otp,
      });

      if (_.isEmpty(otp_exist)) {
        res.json({
          message: "entered otp is invalid",
          status:400,
          data: [],
        });
      }

      const dbTime = dayjs.unix(email_exist.otpExpiryTime);
      const otpExpiredTime = dbTime.add(1, "minute").unix();
      console.log(otpExpiredTime, " 1 minutes after");
      const nowTime = dayjs().unix(email_exist.otpExpiryTime);
      // console.log(nowTime);

      const validityVerify = dayjs
        .unix(otpExpiredTime)
        .isAfter(dayjs.unix(nowTime));
      // console.log(validityVerify);

      if (validityVerify === true) {
        await userModel.findByIdAndUpdate(email_exist._id, {
          isEmailVerified: true,
        });
        res.json({
          message: "Email is verified, you can proceed to login ",
          status:200,
          data: [],
        });
      } else {
        res.json({
          message: "Expired otp",
          status:400,
          data: [],
        });
      }
    } catch (err) {
      throw err;
    }
  }
  //   <<<<<<<<<<<< user dashboard >>>>>>>>>>>>>>>>>>
  async dashboard(req, res) {
    try {
      if (!_.isEmpty(req.user)) {
        let login_user = await userModel.findOne({
          _id: req.user.id,
        });
        res.json({
          message: `Welcome ${login_user.firstname}`,
          status:400,
          data: login_user,
        });
      } else {
        res.json({
          message: "plz login",
          status:401,
          data: [],
        });
      }
    } catch (err) {
      throw err;
    }
  }

  // <<<<<<<<<< logout section >>>>>>>>>>>>>>>

  async logout(req, res) {
    try {
      res.clearCookie("user_token");
      res.status(200).json({
        message: "your account has been loggedOut",
        status:200,
        data: [],
      });
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new loginRegisterController();
