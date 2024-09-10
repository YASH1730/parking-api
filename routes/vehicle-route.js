const express = require("express");
const {Auth} = require("../middleware/auth.js");
const { addVehicle, deleteVehicle } = require("../controller/vehicle-controller.js");

const Router = express.Router();




//vehicle information
Router.post('/add-vehicle',Auth,addVehicle);

Router.delete('/delete-vehicle',Auth,deleteVehicle);


module.exports = Router;