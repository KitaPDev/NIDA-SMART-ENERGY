const systemService = require("../services/system.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function getAllSystem(req, res) {
	try {
		let result = await systemService.getAllSystem();

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = { getAllSystem };
