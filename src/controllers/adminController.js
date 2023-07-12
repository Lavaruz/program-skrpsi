const fs = require("fs");
const path = require("path");
const { Admin } = require("../models");
const response = require("./response");
const bcrypt = require("bcrypt");
const { createToken } = require("../utils/JWT");

function register(req, res) {
  try {
    const { username, password, role } = req.body;
    bcrypt.hash(password, 10).then((hash) => {
      Admin.create({
        username,
        password: hash,
        role,
      }).then((respon) => {
        response(201, "success create new user", respon, res);
      });
    });
  } catch (error) {
    response(
      500,
      "server failed to create new user",
      { error: error.message },
      res
    );
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({
      where: {
        username: username,
      },
    });
    if (admin == null) {
      return res.json({ error: "user not found" });
    }
    const dbPassword = admin.password;
    bcrypt.compare(password, dbPassword).then((match) => {
      if (!match) {
        res.json({ error: "wrong username and password combination" });
      } else {
        const accessToken = createToken(admin);
        res.cookie("access-token", accessToken, {
          maxAge: 3600000,
        });
        res.status(200).json({ message: "LOGEDIN" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function logout(req, res, next) {
  res.clearCookie("access-token");
  res.redirect("/login");
}

module.exports = {
  register,
  login,
  logout,
};
