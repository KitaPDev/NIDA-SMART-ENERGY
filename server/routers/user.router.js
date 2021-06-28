const express = require("express");
const userController = require("../controllers/user.controller");
const authenticateJWT = require("../middleware/authenticateJWT");

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
	userController.resetPassword(req, res);
});

router.get("/user-type/all", async function (req, res) {
	userController.getAllUserType(req, res);
});

router.get("/info", authenticateJWT, async function (req, res) {
	userController.getUserInfo(req, res);
});

router.post("/info", authenticateJWT, async function (req, res) {
	userController.getUserInfo(req, res);
});

router.post("/username", authenticateJWT, async function (req, res) {
	userController.changeUsername(req, res);
});

router.post("/email", authenticateJWT, async function (req, res) {
	userController.changeEmail(req, res);
});

router.post("/profile-image", authenticateJWT, async function (req, res) {
	userController.uploadProfileImage(req, res);
});

router.post("/change-password", authenticateJWT, async function (req, res) {
	userController.changePassword(req, res);
});

router.post("/deactivate", authenticateJWT, async function (req, res) {
	userController.deactivateUser(req, res);
});

router.post("/activate", authenticateJWT, async function (req, res) {
	userController.activateUser(req, res);
});

module.exports = router;
