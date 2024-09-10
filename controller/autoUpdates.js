require("dotenv").config();
const db = require("../connection/conn");
const cron = require("node-cron");
const moment = require("moment");

// update the status to release after booking run every 5 minutes
cron.schedule("*/5 * * * *", () => {
  updateParking();
});

async function updateParking() {
  try {
    // console.log("Checking Started");
    const currentTime = moment()
      .subtract(5, "minutes")
      .format("YYYY-MM-DD HH:mm:ss");
    const todayStart = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss");
    const todayEnd = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");

    let data = await db("request_queue")
      .select("id")
      .where(function () {
        this.where("updated_at", "<=", currentTime)
          .andWhere("updated_at", ">=", todayStart)
          .andWhere("updated_at", "<=", todayEnd)
          .andWhere('status', 'Approved');
      });

    if (data.length === 0) {
      // console.log("Checking Ended with ", data.length);
      return 0;
    }

    data = data.map((row) => row.id);
    console.log(data);
    // update the status on parking to from Approved to Released
    await db("request_queue")
      .whereIn("id", data)
      .update({ status: "Released" });

    // console.log("Checking Ended with ", data.length);
    return 1;
  } catch (error) {
    console.log("Error in Automation Status change >>> ", error);
  }
}
