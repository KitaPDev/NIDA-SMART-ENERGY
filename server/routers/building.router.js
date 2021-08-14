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

module.exports = router;
