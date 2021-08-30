const express = require("express");
const targetController = require("../controllers/target.controller");
const authenticateJWT = require("../middleware/authenticateJWT");

let router = express.Router();

router.post("/people", authenticateJWT, async function (req, res) {
	targetController.getBuildingPeople(req, res);
});

router.post("/", authenticateJWT, async function (req, res) {
	targetController.inputTarget(req, res);
});

router.post("/monthyear", authenticateJWT, async function (req, res) {
	targetController.getAllTargetByMonthYear(req, res);
});

router.post("/monthyear/tariff", authenticateJWT, async function (req, res) {
	targetController.getAllBuildingTariffByMonthYear(req, res);
});

router.post("/building", authenticateJWT, async function (req, res) {
	targetController.getBuildingTargetRange(req, res);
});

router.post("/presets", authenticateJWT, async function (req, res) {
	targetController.getTargetPresets(req, res);
});

module.exports = router;
