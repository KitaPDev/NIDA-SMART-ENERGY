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

async function getDataPowerMonthBuilding(req, res) {
	try {
		let body = req.body;
		let month = body.month;

		if (!month) {
			return res.status(httpStatusCodes.FORBIDDEN).send("Month is required.");
		}

		let lsData = await apiService.getDataPowerMonthBuilding(month);

		let monthKwh_building = {};
		let lsPrevDevice = [];
		for (let data of lsData.slice().reverse()) {
			if (data.system !== "Main" || lsPrevDevice.includes(data.device))
				continue;

			let building = data.building;
			let kwh = data.kwh;

			if (!monthKwh_building[building]) monthKwh_building[building] = 0;

			monthKwh_building[building] += kwh;

			lsPrevDevice.push(data.device);
		}

		lsPrevDevice = [];
		for (let data of lsData) {
			if (data.system !== "Main" || lsPrevDevice.includes(data.device))
				continue;

			let building = data.building;
			let kwh = data.kwh;

			monthKwh_building[building] -= kwh;

			lsPrevDevice.push(data.device);
		}

		return res.status(httpStatusCodes.OK).send(monthKwh_building);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getDataSolarMonth(req, res) {
	try {
		let body = req.body;
		let month = body.month;

		if (!month) {
			return res.status(httpStatusCodes.FORBIDDEN).send("Month is required.");
		}

		let lsData = await apiService.getDataSolarMonth(month);

		let kwhSolar = lsData[lsData.length - 1].kwh - lsData[0].kwh;

		return res.status(httpStatusCodes.OK).send({ kwhSolar });
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = {
	getDataPowerMeterByDatetime,
	getDataSolarByDatetime,
	getDataIaqByDatetime,
	getDataPowerMonthBuilding,
	getDataSolarMonth,
};
