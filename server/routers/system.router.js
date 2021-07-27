const express = require("express");
const systemController = require("../controllers/system.controller");
const authenticateJWT = require("../middleware/authenticateJWT");

let router = express.Router();

router.get("/all", authenticateJWT, async function (req, res) {
	systemController.getAllSystem(req, res);
});

module.exports = router;
