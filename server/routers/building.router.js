const express = require("express");
const buildingController = require("../controllers/building.controller");
const authenticateJWT = require("../middleware/authenticateJWT");

let router = express.Router();

router.get("/all", authenticateJWT, async function (req, res) {
	buildingController.getAll(req, res);
});

module.exports = router;
