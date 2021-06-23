const express = require("express");
const authController = require("../controllers/auth.controller");
const authenticateJWT = require("../middleware/authenticateJWT");

let router = express.Router();

router.post("/login", async function (req, res) {
	authController.login(req, res);
});

router.get("/logout", async function (req, res) {
	authController.logout(req, res);
});

router.get("/username", authenticateJWT, async function (req, res) {
	authController.getUsername(req, res);
});

module.exports = router;
