require("dotenv").config();
const db = require("../connection/conn");
const axios = require("axios");
const admin = require("firebase-admin");

async function addParking(req, res) {
  try {
    let {
      state,
      location,
      address,
      formattedAddress: formatted_address,
      city,
      district,
      vehicle_no,
      new_vehicle,
      list,
    } = req.body;

    let { vehicle_no: user_vehicle_no, name } = req.user;

    // If a new vehicle number is entered, append it to the vehicle list in the user table
    if (!new_vehicle) {
      await db("users")
        .where("vehicle_no", user_vehicle_no)
        .update({ vehicle: JSON.stringify([...list, vehicle_no]) });
    }

    if (
      !address ||
      !location ||
      !state ||
      !city ||
      !district ||
      !vehicle_no ||
      !formatted_address
    ) {
      return res.status(204).send({
        status: 204,
        message: "Missing Payload !!!",
      });
    }

    // Save the entry
    let save = await db.table("parking").insert({
      state,
      location,
      address,
      city,
      user_vehicle_no,
      district,
      vehicle_no,
      formatted_address,
      ...location,
    });

    // This code works for sending notifications to all other users
    // let tokens = await db("notify_token").select('token').whereNot('vehicle_no', user_vehicle_no);
    // tokens = tokens.map(row => row.token);
    // Notify all others about the new parking
    // const payload = {
    //   notification: { title: `${name} added a new parking.`, body: formatted_address }
    // };
    // if (tokens.length)
    //   await admin.messaging().sendToDevice(tokens, payload);

    if (save) {
      return res.status(200).send({
        status: 200,
        message: "Parking added successfully.",
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: 500, message: "Something Went Wrong!" });
  }
}

async function updateParking(req, res) {
  try {
    let { id, state, location, address, slot, city, district } = req.body;

    if (!id || !slot || !address || !location || !state || !city || !district) {
      return res.status(204).send({
        status: 204,
        message: "Missing Payload !!!",
      });
    }
    // Edit the entry
    let edit = await db
      .table("parking")
      .update({
        state,
        location: JSON.stringify(location),
        address,
        slot,
        city,
        district,
      })
      .where("id", id);

    if (edit) {
      return res.status(200).send({
        status: 200,
        message: "Parking details edited successfully.",
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: 500, message: "Something Went Wrong!" });
  }
}

async function getuserParking(req, res) {
  try {
    const response = await db("parking")
      .select("parking.*", "us.name")
      .where("user_vehicle_no", "=", req.user.vehicle_no)
      .leftJoin("users AS us", "us.vehicle_no", "parking.user_vehicle_no");

    if (response) {
      return res.send({
        status: 200,
        message: "All Parking Get Success",
        data: response,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something Went Wrong!" });
  }
}

async function getAllParking(req, res) {
  try {
    let { offset, search } = req.query;
    let { vehicle_no } = req.user;
    offset = parseInt(offset);
    if (search) offset = 0;
    const total = await db("parking").count("id as total");
    const data = await db
      .select("parking.*", "users.name as userName")
      .from("parking")
      .innerJoin("users", "parking.user_vehicle_no", "users.vehicle_no")
      .andWhere((sb) => {
        sb.whereNot("parking.user_vehicle_no", vehicle_no);
        if (search) {
          sb.whereILike("parking.city", `${search}%`);
          sb.orWhereILike("parking.state", `${search}%`);
          sb.orWhereILike("parking.address", `${search}%`);
        }
      })
      .offset(offset)
      .limit(10);

    if (data)
      return res.status(200).send({
        status: 200,
        message: "List fetched successfully.",
        data,
        total: search ? data.length : total[0]?.total,
        offset: offset + 10,
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: 500, message: "Something Went Wrong!" });
  }
}

// Get Coordinates under radius
async function getAllCoordinates(req, res) {
  try {
    const API = process.env.INTERNAL_API;
    // const API = process.env.INTERNAL_API;
    let { origin, range, address } = req.query;
    let { name, vehicle_no } = req.user;
    let { latitude, longitude } = JSON.parse(origin);

    range = parseInt(range);
    // Get the parking available in range
    let data = await db
      .select(
        "parking.*",
        "parking.id as PID",
        "parking.formatted_address",
        "parking.vehicle_no",
        "users.name as userName"
      )
      .from("parking")
      .innerJoin("users", "parking.user_vehicle_no", "users.vehicle_no")
      .andWhere((sb) => {
        sb.whereNot("parking.user_vehicle_no", vehicle_no);
        sb.andWhere("parking.current_status", "Free");
        sb.whereRaw(
          `ST_Distance_Sphere(point(parking.longitude, parking.latitude), point(?, ?)) <= ?`,
          [longitude, latitude, range]
        );
      })
      .first();

    data = data ? [data] : [];

    if (!data.length) {
      console.log(range, " :: Request End No Parking found");
      return res
        .status(200)
        .send({ status: 200, message: "No parking", data: [], total: 0 });
    }

    let bookingIds = [];
    // Sending notifications in respective range 100, 200, 300, 400, 500
    let request = await Promise.all(
      data.map(async (row) => {
        const data = {
          title: `${name} is allotting a parking.`,
          body: row.formatted_address,
          recipient_vehicle_no: row.vehicle_no,
        };
        let booking = await axios.post(
          `${API}/parking/placeBooking`,
          { id: row.id, own_loc: origin },
          {
            headers: {
              authorization: `Bearer ${req.token}`,
            },
          }
        );

        if (booking?.data?.id) {
          bookingIds.push(booking?.data?.id);
          return await axios.post(`${API}/notify/send`, data, {
            headers: {
              authorization: `Bearer ${req.token}`,
            },
          });
        } else return 1;
      })
    );

    if (!bookingIds.length) {
      console.log(range, " :: Request End By booking IDs");
      return res
        .status(200)
        .send({ status: 200, message: "No parking", data: [], total: 0 });
    }

    let timeout = setTimeout(async () => {
      console.log("Deleting requests :: ", range);
      bookingIds.map(async (rId) => {
        await db("request_queue")
          .where("id", rId)
          .andWhere("status", "Pending")
          .del();
      });
      clearInterval(intervalID);
      return res
        .status(200)
        .send({ status: 200, message: "No parking", data: [], total: 0 });
    }, 40000);

    // Check if the request is accepted by users every 10 seconds
    let intervalID = setInterval(async () => {
      // console.log("Range waiting ", range, bookingIds);
      for (let i = 0; i < bookingIds.length; i++) {
        const id = bookingIds[i];
        let result = await db("request_queue")
          .select("parking_id")
          .where("id", id)
          .andWhere("status", "Approved");
        if (result[0]?.parking_id) {
          let parking = await db("parking").where("id", result[0].parking_id);
          bookingIds.map(async (rId) => {
            if (rId !== id) {
              await db("request_queue")
                .where("id", rId)
                .andWhere("status", "Pending")
                .del();
            }
          });
          console.log("Request Accepted");
          clearTimeout(timeout);
          clearInterval(intervalID);
          return res.status(200).send({
            status: 200,
            message: "Parking request approved.",
            data: [...parking],
            total: 1,
          });
        }
      }
    }, 10000);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: 500, message: "Something Went Wrong!" });
  }
}

async function getParking(req, res) {
  try {
    const response = await db("parking")
      .select("*")
      .where("id", "=", req.query.id);
    if (response) {
      return res.send({
        status: 200,
        message: "Parking Get Successfully",
        data: response,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something Went Wrong!" });
  }
}

async function SearchParking(req, res) {
  try {
    const response = await db("parking")
      .select("parking.*", "us.name")
      .where((cb) => {
        cb.whereILike("state", `%${req.query.searchVal}%`);
        cb.orWhereILike("city", `%${req.query.searchVal}%`);
        cb.orWhereILike("address", `%${req.query.searchVal}%`);
      })
      .leftJoin("users AS us", "us.vehicle_no", "parking.user_vehicle_no");

    if (response) {
      return res.send({
        status: 200,
        message: "All Parking Get Success",
        data: response,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something Went Wrong!" });
  }
}

// Add parking route
async function addParkingRequest(req, res) {
  try {
    req.body.location = JSON.stringify(req.body.location);
    req.body.user_id = req.user.jwtPayload.id;
    const response = await db("parking_request").insert(req.body);
    if (response) {
      return res.send({ message: "Parking Request Sent", status: 200 });
    } else {
      return res.send({ message: "Something Went Wrong", status: 203 });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something Went Wrong !" });
  }
}

async function getuserParkingRequest(req, res) {
  try {
    let user_id = req.user.jwtPayload.id;
    const response = await db("parking_request")
      .select("*")
      .where("user_id", "=", user_id);

    if (response) {
      return res.send({
        status: 200,
        message: "All Parking Request Get Success",
        data: response,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something Went Wrong !" });
  }
}

async function bookParking(req, res) {
  try {
    let { id, book_slot, remaining_slot } = req.body;
    let { vehicle_no, name } = req.user;

    if (!id || !book_slot || !remaining_slot || !vehicle_no || !name)
      return res.status(204).send({
        status: 204,
        message: "Missing Payload !!!",
      });

    // Update the slot in DB
    let getLastData = await db("parking").select("booked_slot").where("id", id);
    if (!getLastData[0])
      return res.status(404).send({
        status: 404,
        message: "No parking details found.",
      });

    await db("parking")
      .update({
        slot: remaining_slot,
        booked_slot: book_slot + parseInt(getLastData[0].booked_slot),
      })
      .where("id", id);

    // Now add the book in booking table
    let save = await db("booking").insert({
      booking_slot: book_slot,
      parking_id: id,
      vehicle_no,
      name,
    });

    if (!save)
      return res.status(500).send({ message: "Something Went Wrong !" });

    return res.status(200).send({
      status: 200,
      message: "Your slot has been booked. Happy parking.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something Went Wrong !" });
  }
}

async function getBookingHistory(req, res) {
  try {
    let { offset, search } = req.query;
    let { vehicle_no } = req.user;
    offset = parseInt(offset);
    if (search) offset = 0;
    const total = await db("booking").count("id as total");
    const data = await db("booking")
      .select(["id", "parking_id", "booking_slot", "status", "created_at"])
      .andWhere((sb) => {
        sb.where("vehicle_no", vehicle_no);
        if (search) {
          sb.whereILike("city", `${search}%`);
          sb.orWhereILike("state", `${search}%`);
          sb.orWhereILike("address", `${search}%`);
        }
      })
      .orderBy("created_at", "desc")
      .offset(offset)
      .limit(7);

    if (data)
      return res.status(200).send({
        status: 200,
        message: "List fetched successfully.",
        data,
        total: search ? data.length : total[0]?.total,
        offset: offset + 10,
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: 500, message: "Something Went Wrong !" });
  }
}

async function getParkingDetails(req, res) {
  try {
    let { id } = req.query;

    if (!id)
      return res.status(204).send({
        status: 204,
        message: "Missing Payload !!!",
      });
    let details = await db("parking").where("id", id);

    if (!details.length)
      return res.status(404).send({
        status: 404,
        message: "No details found.",
      });

    return res.status(200).send({
      status: 200,
      message: "Details fetched.",
      data: { ...details[0] },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: 500, message: "Something Went Wrong !" });
  }
}

async function releaseParking(req, res) {
  try {
    let { PID, HID } = req.body;
    if (!PID || !HID)
      return res.status(204).send({
        status: 204,
        message: "Missing Payload !!!",
      });

    // Update the entries
    let parking = await db("parking")
      .update({ current_status: "Free" })
      .where("id", PID);
    let request = await db("request_queue")
      .update({ status: "Released" })
      .where("id", HID);

    if (parking && request)
      return res
        .status(200)
        .send({ status: 200, message: "Parking released successfully." });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: 500, message: "Something Went Wrong !" });
  }
}

async function reachedParking(req, res) {
  try {
    let { PID, HID } = req.body;
    if (!PID || !HID)
      return res.status(204).send({
        status: 204,
        message: "Missing Payload !!!",
      });

    let request = await db("request_queue")
      .update({ status: "Reached" })
      .where("id", HID);

    if (request)
      return res
        .status(200)
        .send({ status: 200, message: "Parking updated to reached." });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ status: 500, message: "Something Went Wrong !" });
  }
}

async function placeBooking(req, res) {
  try {
    let { id, own_loc } = req.body;
    let { vehicle_no, name } = req.user;

    if (!id || !own_loc)
      return res.status(204).send({
        status: 204,
        message: "Missing Payload !!!",
      });

    let check = await db("request_queue")
      .select("id")
      .where("parking_id", id)
      .andWhere("lender_vehicle_no", vehicle_no)
      .andWhere("status", "Pending");

    if (check.length)
      return res.status(200).send({
        status: 200,
        message: "Already applied.",
        id: check[0]?.id,
      });

    let own_vehicle_no = await db('parking').select('vehicle_no').where('id',id).first();  
    own_vehicle_no = own_vehicle_no.vehicle_no

    // Now add the book in booking table
    let save = await db("request_queue").insert({
      parking_id: id,
      lender_vehicle_no: vehicle_no,
      lender_name: name,
      status: "Approved", // for automatic approval
      own_loc, // for automatic approval
      own_vehicle_no,
    });

    if (!save)
      return res.status(500).send({ message: "Something Went Wrong !" });

    return res.status(200).send({
      status: 200,
      message: "Request has been submitted.",
      id: save[0],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something Went Wrong !" });
  }
}

async function getRequests(req, res) {
  try {
    let { offset, search } = req.query;
    let { vehicle_no } = req.user;
    console.log(vehicle_no) 

    let total = await db
      .select(db.raw("COUNT(*) OVER () as total"))
      .from("request_queue")
      .innerJoin("parking", "request_queue.parking_id", "parking.id")
      .where("request_queue.own_vehicle_no", vehicle_no);

    let data = await db
      .select(
        "request_queue.*",
        "parking.id as PID",
        "parking.city",
        "parking.state",
        "parking.address",
        "parking.vehicle_no",
        "parking.location",
        "parking.user_vehicle_no"
      )
      .from("request_queue")
      .innerJoin("parking", "request_queue.parking_id", "parking.id")
      .where("request_queue.own_vehicle_no", vehicle_no)
      .orderBy("request_queue.created_at", "desc")
      .offset(offset)
      .limit(10);

    if (data)
      return res.status(200).send({
        status: 200,
        message: "List fetched successfully.",
        data,
        total: search ? data.length : total[0]?.total,
        offset: offset + 10,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something Went Wrong !" });
  }
}

async function getHistory(req, res) {
  try {
    let { offset, search } = req.query;
    let { vehicle_no } = req.user;

    let total = await db
      .select(db.raw("COUNT(*) OVER () as total"))
      .from("request_queue")
      .innerJoin("parking", "request_queue.parking_id", "parking.id")
      .where("parking.user_vehicle_no", vehicle_no);
    let data = await db
      .select(
        "request_queue.*",
        "parking.id as PID",
        "users.name",
        "parking.city",
        "parking.state",
        "parking.address"
      )
      .from("request_queue")
      .innerJoin("parking", "request_queue.parking_id", "parking.id")
      .innerJoin("users", "users.vehicle_no", "parking.user_vehicle_no")
      .where((sb) => {
        sb.where("request_queue.lender_vehicle_no", vehicle_no);
        if (search) {
          sb.whereILike("parking.city", `${search}%`);
          sb.orWhereILike("parking.state", `${search}%`);
          sb.orWhereILike("parking.address", `${search}%`);
        }
      })
      .orderBy("request_queue.created_at", "desc")
      .offset(offset)
      .limit(10);

    if (data)
      return res.status(200).send({
        status: 200,
        message: "List fetched successfully.",
        data,
        total: search ? data.length : total[0]?.total,
        offset: offset + 10,
      });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something Went Wrong !" });
  }
}

async function approveRequest(req, res) {
  try {
    let { id, PID } = req.body;

    if (!id || !PID)
      return res.status(204).send({
        status: 204,
        message: "Missing payload.",
      });

    let updateRequest = await db("request_queue")
      .update("status", "Approved")
      .where("id", id);
    await db("parking").update("current_status", "Booked").where("id", PID);

    if (updateRequest)
      return res
        .status(200)
        .send({ status: 200, message: "Request Approved." });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something Went Wrong !" });
  }
}

module.exports = {
  getAllCoordinates,
  getHistory,
  approveRequest,
  getRequests,
  placeBooking,
  releaseParking,
  getParkingDetails,
  getBookingHistory,
  bookParking,
  getuserParkingRequest,
  addParking,
  getAllParking,
  updateParking,
  SearchParking,
  getParking,
  getuserParking,
  addParkingRequest,
  reachedParking,
};
