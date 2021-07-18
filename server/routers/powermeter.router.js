const express = require("express");
const powermeterController = require("../controllers/powermeter.controller");
const authenticateJWT = require("../middleware/authenticateJWT");

let router = express.Router();

router.post("/", authenticateJWT, async function (req, res) {
	powermeterController.getDataByDatetime(req, res);
});

module.exports = router;
