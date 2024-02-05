const User = require("../models/users");
const bcrypt = require("bcrypt");

function isStringValid(s) {
  if (s == undefined || s.length === 0) {
    return true;
  } else {
    return false;
  }
}

const signUpUserDetails = async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const phonenumber = req.body.phonenumber;
  const password = req.body.password;

  if (
    isStringValid(username) ||
    isStringValid(email) ||
    isStringValid(password) ||
    isStringValid(phonenumber)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Required all fields" });
  }

  const saltrounds = 10;
  bcrypt.hash(password, saltrounds, async (err, hash) => {
    if (err) {
      console.log(err);
    }
    await User.create({
      username: username,
      email: email,
      phonenumber: phonenumber,
      password: hash,
    })
      .then((details) => {
        res.status(201).json({
          success: true,
          message: "Successfully created new user",
          users: details,
        });
      })
      .catch((err) => {
        res.status(500).json({ success: true, message: err, error:err.errors[0].message });
      });
  });
};

const loginUserDetails = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (isStringValid(email) || isStringValid(password)) {
    return res
      .status(400)
      .json({ success: false, message: "Required all fields" });
  }

  await User.findAll({ where: { email: email } })
    .then((details) => {
      if (details.length > 0) {
        bcrypt.compare(password, details[0].password, (err, result) => {
          if (err) {
            throw new Error("Something went wrong");
          }
          if (result === true) {
            res.status(200).json({
              success: true,
              message: "User login successful",
              userDetail: result,
            });
          } else {
            res
              .status(401)
              .json({ success: false, message: "Password does not match" });
          }
        });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    })
    .catch((err) => {
      res.status(500).json({ success: true, message: err });
    });
};

module.exports = {
  signUpUserDetails,
  loginUserDetails,
};
