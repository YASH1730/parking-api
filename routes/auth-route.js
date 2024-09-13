const express = require("express");
const { register, login, addDetails } = require("../controller/auth-controller");
const {CheckUserCred} = require("../middleware/auth.js");
const bcrypt = require("bcrypt");

const router = express.Router();


//register route
router.post("/register",CheckUserCred,register);

//login route
router.post("/login",login);

//addDetails route
router.post("/addDetails",addDetails);



module.exports = router;