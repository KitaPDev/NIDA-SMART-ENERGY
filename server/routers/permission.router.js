const express = require("express");
const permissionController = require("../controllers/permission.controller");
const authenticateJWT = require("../middleware/authenticateJWT");
const checkPermission = require("../middleware/checkPermission");

let router = express.Router();

router.get(
	"/all",
	authenticateJWT,
	(req, res, next) => {
		checkPermission(req, res, next, "Set Permissions");
	},
	async function (req, res) {
		permissionController.getAllPermission(req, res);
	}
);

router.get("/user-type", authenticateJWT, async function (req, res) {
	permissionController.getAllUserTypePermission(req, res);
});

router.post(
	"/update",
	authenticateJWT,
	(req, res, next) => {
		checkPermission(req, res, next, "Set Permissions");
	},
	async function (req, res) {
		permissionController.updateUserTypePermission(req, res);
	}
);

router.get("/", authenticateJWT, async function (req, res) {
	permissionController.getUserPermission(req, res);
});

module.exports = router;
