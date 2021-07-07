const deviceService = require("../services/device.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function getAllDevice(req, res) {
	try {
		let result = await deviceService.getAllDevice();

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = { getAllDevice };
