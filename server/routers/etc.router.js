const express = require("express");
const etcController = require("../controllers/etc.controller");
const authenticateJWT = require("../middleware/authenticateJWT");

let router = express.Router();

router.get("/visitors", authenticateJWT, async function (req, res) {
	etcController.getVisitors(req, res);
});

router.post("/share", authenticateJWT, async function (req, res) {
	etcController.share(req, res);
});

module.exports = router;
