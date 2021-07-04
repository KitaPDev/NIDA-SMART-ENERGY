const express = require("express");
const activityController = require("../controllers/activity.controller");
const authenticateJWT = require("../middleware/authenticateJWT");

let router = express.Router();

router.post("/", authenticateJWT, async function (req, res) {
	activityController.getActivityPeriod(req, res);
});

module.exports = router;
