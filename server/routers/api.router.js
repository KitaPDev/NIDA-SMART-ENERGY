const express = require("express");
const apiController = require("../controllers/api.controller");
const authenticateJWT = require("../middleware/authenticateJWT");

let router = express.Router();

router.post("/power/datetime", authenticateJWT, async function (req, res) {
	apiController.getDataPowerMeterByDatetime(req, res);
});

router.post("/iaq/datetime", authenticateJWT, async function (req, res) {
	apiController.getDataIaqByDatetime(req, res);
});

router.post("/solar/datetime", authenticateJWT, async function (req, res) {
	apiController.getDataSolarByDatetime(req, res);
});

router.post("/power/month", authenticateJWT, async function (req, res) {
	apiController.getDataPowerMonthBuilding(req, res);
});

router.post("/solar/month", authenticateJWT, async function (req, res) {
	apiController.getDataSolarMonth(req, res);
});

module.exports = router;
