const express = require("express");
const buildingController = require("../controllers/building.controller");
const authenticateJWT = require("../middleware/authenticateJWT");

let router = express.Router();

router.get("/all", authenticateJWT, async function (req, res) {
	buildingController.getAll(req, res);
});

router.post("/data", authenticateJWT, async function (req, res) {
	buildingController.getData(req, res);
});

router.post("/bill/compare", authenticateJWT, async function (req, res) {
	buildingController.getBillCompare(req, res);
});

router.post("/energy/datetime", authenticateJWT, async function (req, res) {
	buildingController.getEnergyUsageDatetime(req, res);
});

router.post("/bill/datetime", authenticateJWT, async function (req, res) {
	buildingController.getElectricityBillDatetime(req, res);
});

module.exports = router;
