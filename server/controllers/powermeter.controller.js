const powermeterService = require("../services/powermeter.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;
const { response } = require("express");

async function getDataByDatetime(req, res) {
	try {
		let body = req.body;
		let start = body.start;
		let end = body.end;

		if (!start && !end) {
			return res
				.status(httpStatusCodes.FORBIDDEN)
				.send("Please provide start and end datetimes.");
		}

		let result = await powermeterService.getLogPowerMeterByDatetime(start, end);

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = { getDataByDatetime };
