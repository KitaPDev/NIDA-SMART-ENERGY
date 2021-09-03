const express = require("express");
const userController = require("../controllers/user.controller");
const authenticateJWT = require("../middleware/authenticateJWT");
const checkPermission = require("../middleware/checkPermission");
const logActivity = require("../middleware/activityLogger");

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

router.post(
	"/reset-password/:hash",
	(req, res, next) => {
		logActivity(req, res, next, 3);
	},
	async function (req, res) {
		userController.resetPassword(req, res);
	}
);

router.get("/user-type/all", async function (req, res) {
	userController.getAllUserType(req, res);
});

router.get("/info", authenticateJWT, async function (req, res) {
	userController.getUserInfo(req, res);
});

router.post("/info", authenticateJWT, async function (req, res) {
	userController.getUserInfo(req, res);
});

router.post(
	"/username",
	authenticateJWT,
	(req, res, next) => {
		checkPermission(req, res, next, "Add/Edit/Delete Other User");
	},
	async function (req, res) {
		userController.changeUsername(req, res);
	}
);

router.post(
	"/email",
	(req, res, next) => {
		checkPermission(req, res, next, "Add/Edit/Delete Other User");
	},
	authenticateJWT,
	async function (req, res) {
		userController.changeEmail(req, res);
	}
);

router.post(
	"/profile-image",
	(req, res, next) => {
		checkPermission(req, res, next, "Add/Edit/Delete Other User");
	},
	authenticateJWT,
	async function (req, res) {
		userController.uploadProfileImage(req, res);
	}
);

router.post(
	"/change-password",
	(req, res, next) => {
		checkPermission(req, res, next, "Add/Edit/Delete Other User");
	},
	authenticateJWT,
	async function (req, res) {
		userController.changePassword(req, res);
	}
);

router.post(
	"/deactivate",
	(req, res, next) => {
		checkPermission(req, res, next, "Add/Edit/Delete Other User");
	},
	authenticateJWT,
	async function (req, res) {
		userController.deactivateUser(req, res);
	}
);

router.post(
	"/activate",
	(req, res, next) => {
		checkPermission(req, res, next, "Add/Edit/Delete Other User");
	},
	authenticateJWT,
	async function (req, res) {
		userController.activateUser(req, res);
	}
);

router.get(
	"/all",
	(req, res, next) => {
		checkPermission(req, res, next, "Add/Edit/Delete Other User");
	},
	authenticateJWT,
	async function (req, res) {
		userController.getAllUser(req, res);
	}
);

router.get("/type", authenticateJWT, async function (req, res) {
	userController.getUserType(req, res);
});

router.post(
	"/approve",
	(req, res, next) => {
		checkPermission(req, res, next, "Add/Edit/Delete Other User");
	},
	authenticateJWT,
	async function (req, res) {
		userController.approveUserType(req, res);
	}
);

router.get("/username", authenticateJWT, async function (req, res) {
	userController.getUsername(req, res);
});

module.exports = router;
