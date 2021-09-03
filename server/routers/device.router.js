const express = require("express");
const deviceController = require("../controllers/device.controller");
const authenticateJWT = require("../middleware/authenticateJWT");
const checkPermission = require("../middleware/checkPermission");
const logActivity = require("../middleware/activityLogger");

let router = express.Router();

router.get("/all", authenticateJWT, async function (req, res) {
	deviceController.getAllDevice(req, res);
});

router.post(
	"/",
	(req, res, next) => {
		checkPermission(req, res, next, "Add/Edit/Delete Meter Information");
	},
	(req, res, next) => {
		logActivity(req, res, next, 4);
	},
	authenticateJWT,
	async function (req, res) {
		deviceController.newDevice(req, res);
	}
);

router.post(
	"/edit",
	(req, res, next) => {
		checkPermission(req, res, next, "Add/Edit/Delete Meter Information");
	},
	(req, res, next) => {
		logActivity(req, res, next, 4);
	},
	authenticateJWT,
	async function (req, res) {
		deviceController.editDevice(req, res);
	}
);

router.post(
	"/delete",
	(req, res, next) => {
		checkPermission(req, res, next, "Add/Edit/Delete Meter Information");
	},
	(req, res, next) => {
		logActivity(req, res, next, 4);
	},
	authenticateJWT,
	async function (req, res) {
		deviceController.deleteDevice(req, res);
	}
);

router.get("/all/latest", authenticateJWT, async function (req, res) {
	deviceController.getAllDeviceLatestLog(req, res);
});

router.post(
	"/export",
	(req, res, next) => {
		checkPermission(req, res, next, "Export Information");
	},
	authenticateJWT,
	async function (req, res) {
		deviceController.getExportData(req, res);
	}
);

module.exports = router;
