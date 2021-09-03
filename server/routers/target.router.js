const express = require("express");
const targetController = require("../controllers/target.controller");
const authenticateJWT = require("../middleware/authenticateJWT");
const checkPermission = require("../middleware/checkPermission");
const logActivity = require("../middleware/activityLogger");

let router = express.Router();

router.post("/people", authenticateJWT, async function (req, res) {
	targetController.getBuildingPeople(req, res);
});

router.post(
	"/",
	authenticateJWT,
	(req, res, next) => {
		checkPermission(req, res, next, "Set Target");
	},
	(req, res, next) => {
		checkPermission(req, res, next, "Edit Amount of People");
	},
	(req, res, next) => {
		logActivity(req, res, next, 1);
	},
	async function (req, res) {
		targetController.inputTarget(req, res);
	}
);

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

router.post("/energy/compare", authenticateJWT, async function (req, res) {
	targetController.getEnergyUseCompareData(req, res);
});

router.get("/energy/year", authenticateJWT, async function (req, res) {
	targetController.getDataEnergyMonthPastYear(req, res);
});

module.exports = router;
