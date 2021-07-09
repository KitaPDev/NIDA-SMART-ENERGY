const permissionService = require("../services/permission.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function getAllPermission(req, res) {
	try {
		let result = await permissionService.getAllPermission();

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getAllUserTypePermission(req, res) {
	try {
		let result = await permissionService.getAllUserTypePermission();

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = { getAllPermission, getAllUserTypePermission };
