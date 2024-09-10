const db = require("../connection/conn");

async function addVehicle(req, res) {
  try {
    const response = await db("vehicle_details").insert(req.body);

    if (response) {
      return res.send({ message: "Vehicle Details Added", status: 200 });
    } else {
      return res.send({ message: "Failed to Add Vehicle Details", status: 400 });
    }
  } catch (error) {
    console.log("Error while calling add vehicle API", error);
    return res.status(500).send({ message: "Something Went Wrong!" });
  }
}

async function deleteVehicle(req, res) {
  try {
    const { id } = req.query;

    const doesVehicleExist = await db("vehicle_details")
      .select("id")
      .where("id", id);

    if (!doesVehicleExist.length) {
      return res.status(404).send({ status: 404, message: "Vehicle Details Not Found" });
    }

    const response = await db("vehicle_details")
      .where("id", id)
      .del();

    if (response) {
      return res.send({ message: "Vehicle Removed", status: 200 });
    } else {
      return res.send({ message: "Failed to Remove Vehicle", status: 400 });
    }
  } catch (error) {
    console.log("Error while calling Delete vehicle API", error);
    return res.status(500).send({ message: "Something Went Wrong!" });
  }
}

module.exports = { addVehicle, deleteVehicle };
