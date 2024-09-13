require("dotenv").config();
const db = require("../connection/conn");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const MailGen = require("mailgen");

// Function to generate a JWT token
async function getToken(payload = { name: "Yashw" }) {
  try {
    let token = await jwt.sign(payload, process.env.SECURE_KEY);
    return token;
  } catch (error) {
    throw new Error("Token generation failed"); // Throw an error to be caught in the `login` function
  }
}

// Register function to create a new user
async function register(req, res) {
  try {
    let { password, userName, role, vehicle_no } = req.body;

    const response = await db("users").insert({
      password,
      name: userName,
      role,
      vehicle_no,
    });

    if (response)
      return res.status(200).send({ status: 200, message: "Registration Completed." });

  } catch (error) {
    console.log("Error while calling Register API", error);
    return res.status(500).send({ success: false, message: "Internal Server Error", data: error });
  }
}
// addDetails function to create a new user
async function addDetails(req, res) {
  try {
    let { userName, mobile, email, vehicle_no } = req.body;

    const response = await db("users").update({
      name: userName,
      mobile,
      email
    }).where('vehicle_no',vehicle_no);

    if (response)
      return res.status(200).send({ status: 200, message: "Registration Completed." });

  } catch (error) {
    console.log("Error while calling Register API", error);
    return res.status(500).send({ success: false, message: "Internal Server Error", data: error });
  }
}

// Login function to authenticate a user
async function login(req, res) {
  try {
    let { vehicle_no, password } = req.body;
    if (!vehicle_no || !password)
      return res.status(204).send({
        status: 204,
        message: "Missing Payload !!!",
      });

    vehicle_no = vehicle_no.toLowerCase().trim();

    let details = await db("users")
      .select([
        "password",
        "name",
        "email",
        "mobile",
        "vehicle",
        "vehicle_no",
      ])
      .where({ vehicle_no })
      .first();
// console.log(details)
    if (!details) {
      return res.status(203).send({ status: 403, message: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, details.password);
    if (!match)
      return res.status(203).send({
        status: 203,
        message: "Invalid credentials.",
      });

    delete details.password;
    let token = await getToken({ ...details });
    return res.status(200).send({
      status: 200,
      message: "Login successful.",
      data: { ...details, token },
    });
  } catch (error) {
    console.log("Login API Error >>>", error);
    return res.status(500).send({ success: false, message: "Internal Server Error", data: error });
  }
}

module.exports = {
  register,
  login,
  addDetails
};
