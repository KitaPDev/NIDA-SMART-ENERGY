const express = require("express");
let router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/login", async function (req, res) {
	authController.login(req, res);
});

router.post("/logout", async function (req, res) {
	authController.logout(req, res);
});

router.post("/token", async function (req, res) {
	authController.newToken(req, res);
});

module.exports = router;
