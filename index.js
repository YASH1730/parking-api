require('./controller/autoUpdates.js');
const cors = require("cors");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const db = './connection/conn';

// initialize the Firebase SDK in node 
var admin = require("firebase-admin");
var serviceAccount = require("./parking-app-c8a09-firebase-adminsdk-id81w-efb3deb0e2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.use(cors());

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', (req, res) => {
  res.send("Parking Management App Server is Running");
  res.end();
});

app.use('/auth', require('./routes/auth-route.js'));
app.use('/notify', require('./routes/notification-route.js'));
app.use('/parking', require('./routes/parking-route.js'));
app.use('/vehicle', require('./routes/vehicle-route.js'));

const server = app.listen(PORT, () => {
  console.log(`Server is listening on Port No: ${PORT}`);
});

// handle the Commands
const gracefulShutdown = () => {
  console.info('SIGTERM signal received.');
  // close the server
  server.close(() => {
    console.log('Http server closed.');
  });
};

// Listen for shutdown signals
process.on('SIGINT', gracefulShutdown); // Ctrl+C
process.on('SIGTERM', gracefulShutdown); // Termination signal
