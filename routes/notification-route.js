const { sendNotification, saveToken, vanishToken } = require('../controller/notification');
const {Auth} = require("../middleware/auth.js");

const route = require('express').Router();

// route.post('/send',Auth,sendNotification);
route.post('/send',Auth,sendNotification);

route.post('/saveToken',Auth,saveToken);

route.post('/vanishToken',Auth,vanishToken);


module.exports = route;