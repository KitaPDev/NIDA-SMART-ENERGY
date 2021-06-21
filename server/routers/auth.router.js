const express = require("express");
let router = express.Router();

const authController = require("../controllers/auth.controller");
const tokenChecker = require("../middleware/tokenChecker");

router.post("/login", async function (req, res) {
	authController.login(req, res);
});

router.get("/logout", async function (req, res) {
	authController.logout(req, res);
});

router.get("/username", tokenChecker, async function (req, res) {
	authController.getUsername(req, res);
});

module.exports = router;
