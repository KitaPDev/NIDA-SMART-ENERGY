const express = require("express");
const deviceController = require("../controllers/device.controller");
const authenticateJWT = require("../middleware/authenticateJWT");

let router = express.Router();

router.get("/all", authenticateJWT, async function (req, res) {
	deviceController.getAllDevice(req, res);
});

router.post("/", authenticateJWT, async function (req, res) {
	deviceController.newDevice(req, res);
});

router.post("/edit", authenticateJWT, async function (req, res) {
	deviceController.editDevice(req, res);
});

router.post("/delete", authenticateJWT, async function (req, res) {
	deviceController.deleteDevice(req, res);
});

router.get("/all/latest", authenticateJWT, async function (req, res) {
	deviceController.getAllDeviceLatestLog(req, res);
});

module.exports = router;
