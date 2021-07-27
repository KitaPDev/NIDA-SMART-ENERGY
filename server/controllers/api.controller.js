const apiService = require("../services/api.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function getDataPowerMeterByDatetime(req, res) {
	try {
		let body = req.body;
		let start = body.start;
		let end = body.end;

		if (!start && !end) {
			return res
				.status(httpStatusCodes.FORBIDDEN)
				.send("Please provide start and end datetimes.");
		}

		let result = await apiService.getDataPowerMeter(start, end);

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getDataSolarByDatetime(req, res) {
	try {
		let body = req.body;
		let start = body.start;
		let end = body.end;

		if (!start && !end) {
			return res
				.status(httpStatusCodes.FORBIDDEN)
				.send("Please provide start and end datetimes.");
		}

		let result = await apiService.getDataSolar(start, end);

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getDataIaqByDatetime(req, res) {
	try {
		let body = req.body;
		let start = body.start;
		let end = body.end;

		if (!start && !end) {
			return res
				.status(httpStatusCodes.FORBIDDEN)
				.send("Please provide start and end datetimes.");
		}

		let result = await apiService.getDataIaq(start, end);

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = {
	getDataPowerMeterByDatetime,
	getDataSolarByDatetime,
	getDataIaqByDatetime,
};
