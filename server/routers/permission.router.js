const express = require("express");
const permissionController = require("../controllers/permission.controller");
const authenticateJWT = require("../middleware/authenticateJWT");

let router = express.Router();

router.get("/all", authenticateJWT, async function (req, res) {
	permissionController.getAllPermission(req, res);
});

router.get("/user-type", authenticateJWT, async function (req, res) {
	permissionController.getAllUserTypePermission(req, res);
});

router.post("/update", authenticateJWT, async function (req, res) {
	permissionController.updateUserTypePermission(req, res);
});

module.exports = router;
