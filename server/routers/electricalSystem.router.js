const express = require("express");
const electricalSystemController = require("../controllers/electricalSystem.controller");
const authenticateJWT = require("../middleware/authenticateJWT");

let router = express.Router();

router.get("/all", authenticateJWT, async function (req, res) {
	electricalSystemController.getAllElectricalSystem(req, res);
});

module.exports = router;
