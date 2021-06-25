const express = require("express");
const targetController = require("../controllers/target.controller");
const authenticateJWT = require("../middleware/authenticateJWT");

let router = express.Router();

// router.post("/login", async function (req, res) {
// 	targetController.login(req, res);
// });

module.exports = router;
