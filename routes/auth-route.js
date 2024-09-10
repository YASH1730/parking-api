const express = require("express");
const { register, login } = require("../controller/auth-controller");
const {CheckUserCred} = require("../middleware/auth.js");
const bcrypt = require("bcrypt");

const router = express.Router();


//register route
router.post("/register",CheckUserCred,register);

//login route
router.post("/login",login);



module.exports = router;