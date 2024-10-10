require("dotenv").config();
const db = require("../connection/conn");
const cron = require("node-cron");
const moment = require("moment");

// update the status to release after booking run every 5 minutes
cron.schedule("*/5 * * * *", () => {
  updateParking();
});
updateParking()
async function updateParking() {
  try {
    // console.log("Checking Started");
    const currentTime = moment()
      .subtract(5, "minutes")
      .format("YYYY-MM-DD HH:mm:ss");
    const todayStart = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss");
    const todayEnd = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");

    let data = await db("request_queue")
    .select("id", "parking_id")
    .where(function () {
      this.whereBetween("updated_at", [todayStart, todayEnd])
        .andWhere("status", "Approved");
    });
  
    if (!data.length) {
      console.log("Checking Ended with ", data);
      return 0;
    }

    const parking_ids = data.map(row=>row.parking_id);
    const ids = data.map(row=>row.id);
    console.log(">>",parking_ids
      ,ids)

    // update the status on parking to from Approved to Released
    await db("parking")
      .whereIn("id", parking_ids)
      .update({ current_status: "Released" });
    await db("request_queue")
      .whereIn("id", ids)
      .update({ status: "Released" });

    // console.log("Checking Ended with ", data.length);
    return 1;
  } catch (error) {
    console.log("Error in Automation Status change >>> ", error);
  }
}
