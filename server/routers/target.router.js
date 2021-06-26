const express = require("express");
const targetController = require("../controllers/target.controller");
const authenticateJWT = require("../middleware/authenticateJWT");

let router = express.Router();

router.post("/people", authenticateJWT, async function (req, res) {
	targetController.getBuildingPeople(req, res);
});

module.exports = router;
