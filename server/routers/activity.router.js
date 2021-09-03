const express = require("express");
const activityController = require("../controllers/activity.controller");
const authenticateJWT = require("../middleware/authenticateJWT");
const checkPermission = require("../middleware/checkPermission");

let router = express.Router();

router.post(
	"/",
	authenticateJWT,
	(req, res, next) => {
		checkPermission(req, res, next, "View Other's Activity Log");
	},
	async function (req, res) {
		activityController.getActivityPeriod(req, res);
	}
);

module.exports = router;
