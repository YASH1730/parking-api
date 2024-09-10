const { addParking, getAllParking, SearchParking, getParking, getuserParking, updateParking, addParkingRequest, getuserParkingRequest, bookParking, getBookingHistory, getParkingDetails, releaseParking, placeBooking, getRequests, approveRequest, getHistory, getAllCoordinates, reachedParking } =  require("../controller/parking-controller.js");

const express = require("express");
const {Auth} = require("../middleware/auth.js");

const Router = express.Router();


//secure route
//login required

Router.post('/add',Auth,addParking);

Router.patch('/update',Auth,updateParking);

Router.get('/get-parking',Auth,getuserParking);

Router.get('/get-all-parking',Auth,getAllParking);

Router.get('/getAllCoordinates',Auth,getAllCoordinates);

Router.get('/get-single-parking',Auth,getParking);


Router.post('/bookParking',Auth,bookParking);

Router.get('/getBookingHistory',Auth,getBookingHistory);

Router.get('/getParkingDetails',Auth,getParkingDetails);

Router.patch('/releaseParking',Auth,releaseParking);

Router.post('/placeBooking',Auth,placeBooking);

Router.get('/getRequests',Auth,getRequests);

Router.post('/approveRequest',Auth,approveRequest);

Router.get('/getHistory',Auth,getHistory);

Router.patch('/reachedParking',Auth,reachedParking);


//search parking area
Router.get('/search',Auth,SearchParking);


//add parking request
Router.post('/add-parking-request',Auth,addParkingRequest);

//users parking
Router.get('/get-users-parking-req',Auth,getuserParkingRequest);


module.exports = Router;