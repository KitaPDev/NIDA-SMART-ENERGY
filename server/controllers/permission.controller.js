const permissionService = require("../services/permission.service");
const authService = require("../services/auth.service");
const userService = require("../services/user.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function getAllPermission(req, res) {
	try {
		let result = await permissionService.getAllPermission();

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getAllUserTypePermission(req, res) {
	try {
		let result = await permissionService.getAllUserTypePermission();

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function updateUserTypePermission(req, res) {
	try {
		let body = req.body;
		let userTypeID = body.user_type_id;
		let permissionID = body.permission_id;

		await permissionService.updateUserTypePermission(userTypeID, permissionID);

		return res.status(httpStatusCodes.OK).send();
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getUserPermission(req, res) {
	try {
		let username = await authService.getUsernameFromCookies(req);

		let lsPermission = [];

		if (username === "Super Admin") {
			lsPermission = await permissionService.getAllPermission();
		} else {
			if (await userService.isUserTypeApproved(username)) {
				lsPermission = await permissionService.getPermissionsByUsername(
					username
				);
			} else {
				lsPermission = await permissionService.getGeneralUserPermissions();
			}
		}

		return res.status(httpStatusCodes.OK).send(lsPermission);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = {
	getAllPermission,
	getAllUserTypePermission,
	updateUserTypePermission,
	getUserPermission,
};
