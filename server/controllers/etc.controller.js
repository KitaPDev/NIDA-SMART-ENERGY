const etcService = require("../services/etc.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function getVisitors(req, res) {
	try {
		let result = await etcService.getVisitors();

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = {
	getVisitors,
};
