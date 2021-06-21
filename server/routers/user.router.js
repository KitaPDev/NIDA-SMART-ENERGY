const express = require("express");
const userController = require("../controllers/user.controller");
const tokenChecker = require("../middleware/tokenChecker");

let router = express.Router();

router.post("/register", async function (req, res) {
	userController.register(req, res);
});

router.get("/confirm-email/:hash", async function (req, res) {
	userController.confirmEmail(req, res);
});

router.post("/forgot-password", async function (req, res) {
	userController.forgotPassword(req, res);
});

router.get("/reset-password/:hash", async function (req, res) {
	userController.getResetPasswordForm(req, res);
});

router.post("/reset-password/:hash", async function (req, res) {
	userController.changePassword(req, res);
});

router.get("/user-type/all", async function (req, res) {
	userController.getAllUserType(req, res);
});

module.exports = router;
