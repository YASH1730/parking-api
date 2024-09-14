const admin = require("firebase-admin");
const db = require("../connection/conn");

exports.sendNotification = async (req, res) => {
  try {
    const { title, body, recipient_vehicle_no, vehicle_no } = req.body;
    // const { vehicle_no } = req.user;
    console.log(req.body)

    if (!recipient_vehicle_no || !vehicle_no || !title || !body) {
      return res.status(203).send({
        status: 203,
        message: "Missing payload!",
      });
    }

    // Check if the recipient token is in the database
    let registrationTokens = await db("notify_token")
      .select("token")
      .where("vehicle_no", recipient_vehicle_no);

      console.log(registrationTokens)

    // If user is not logged in, save the notification
    if (!registrationTokens.length) {
      await db("notification").insert({
        vehicle_no: recipient_vehicle_no,
        message: { title, body },
        status: "pending",
      });
      return res.status(200).send({
        status: 200,
        send: "Notification sent successfully.",
      });
    }

    registrationTokens = registrationTokens.map(row => row.token);
    const notification = {
      notification: {
        title,
        body,
      }
    };
    
    // Prepare the message payload
    const message = {
      notification: {
        title: title,
        body: body
      },
      tokens: registrationTokens 
    };
    const response = await admin.messaging().sendEachForMulticast(message);
  
  console.log(JSON.stringify(response));

    return res
      .status(200)
      .json({ message: "Successfully sent notifications!" });
  } catch (err) {
    console.log("Send Notification Error :: ", err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong!" });
  }
};

exports.saveToken = async (req, res) => {
  try {
    let { token } = req.body;
    let { vehicle_no } = req.user;

    if (!token || !vehicle_no)
      return res.status(203).send({
        status: 203,
        message: "Missing payload!",
      });

    await db("notify_token").insert({
      vehicle_no,
      token,
    });

    return res.status(200).send({
      status: 200,
      message: "Token saved successfully.",
    });
  } catch (error) {
    console.log("Save Token Error :: ", error);
    return res.status(500).send({
      status: 500,
      message: "Something went wrong!",
    });
  }
};

exports.vanishToken = async (req, res) => {
  try {
    let { notify_token } = req.body;
    let { vehicle_no } = req.user;

    await db("notify_token").where((sq) => {
      sq.where('vehicle_no', vehicle_no);
      sq.andWhere('token', notify_token);
    }).del();

    return res.status(200).send({
      status: 200,
      message: "Token vanished successfully.",
    });
  } catch (error) {
    console.log("Vanish Token Error :: ", error);
    return res.status(500).send({
      status: 500,
      message: "Something went wrong!",
    });
  }
};

async function list() {
  let tokens = await db('notify_token');
  console.log(tokens);
}

async function list2() {
  let tokens = await db('notify_token').del();
  console.log(tokens);
}
