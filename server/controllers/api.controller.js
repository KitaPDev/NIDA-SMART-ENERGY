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

		let lsData = await apiService.getDataPowerMonth(month);

		let monthKwh_building = {};
		let lsPrevDevice = [];
		for (let data of lsData.slice().reverse()) {
			let system = data.system;
			let building = data.building;
			let kwh = data.kwh;

			if (
				system !== "Main" ||
				lsPrevDevice.includes(data.device) ||
				kwh === null
			) {
				continue;
			}

			if (!monthKwh_building[building]) monthKwh_building[building] = 0;
			monthKwh_building[building] += kwh;

			lsPrevDevice.push(data.device);
		}

		lsPrevDevice = [];
		for (let data of lsData) {
			let system = data.system;
			let building = data.building;
			let kwh = data.kwh;

			if (
				system !== "Main" ||
				lsPrevDevice.includes(data.device) ||
				kwh === null
			) {
				continue;
			}

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

async function getBillCompare(req, res) {
	try {
		let body = req.body;
		let dateFrom = new Date(body.date_from);
		let dateTo = new Date(body.date_to);

		let data = await apiService.getBillCompareData(dateFrom, dateTo);

		let bill_building_date = {};
		let lsLog_date_month_year = data.lsLog_date_month_year;
		let lsTarget = data.lsTarget;

		for (let [year, lsLog_date_month] of Object.entries(
			lsLog_date_month_year
		)) {
			for (let [month, lsLog_date] of Object.entries(lsLog_date_month)) {
				for (let [d, lsLog] of Object.entries(lsLog_date)) {
					let date = new Date(year, month, d);
					let strDate = date.toString();

					let lsPrevDevice = [];
					for (let log of lsLog.slice().reverse()) {
						let building = log.building;
						let device = log.device;
						let kwh = log.kwh;
						let system = log.system;

						if (
							system !== "Main" ||
							lsPrevDevice.includes(device) ||
							kwh === null
						) {
							continue;
						}
						lsPrevDevice.push(device);

						if (!bill_building_date[strDate]) {
							bill_building_date[strDate] = {};
						}
						let bill_building = bill_building_date[strDate];

						if (!bill_building[building]) bill_building[building] = 0;
						bill_building[building] += kwh;
					}

					lsPrevDevice = [];
					for (let log of lsLog) {
						let building = log.building;
						let device = log.device;
						let kwh = log.kwh;
						let system = log.system;

						if (
							system !== "Main" ||
							lsPrevDevice.includes(device) ||
							kwh === null
						) {
							continue;
						}
						lsPrevDevice.push(device);

						bill_building_date[strDate][building] -= kwh;
					}
				}
			}
		}

		for (let [strDate, bill_building] of Object.entries(bill_building_date)) {
			let date = new Date(strDate);

			for (let [building, bill] of Object.entries(bill_building)) {
				let tariff = 4;
				let target = lsTarget.find((target) => {
					if (target !== undefined) {
						return (
							target.month === date.getMonth() &&
							target.year === date.getFullYear() &&
							target.building === building
						);
					}
				});
				if (target !== undefined) {
					if (target.tariff !== null) tariff = target.tariff;
				}
				bill_building_date[strDate][building] = bill * tariff;
			}
		}

		return res
			.status(httpStatusCodes.OK)
			.send({ bill_building_date, lsTarget });
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = {
	getDataPowerMeterByDatetime,
	getDataSolarByDatetime,
	getDataIaqByDatetime,
	getDataPowerMonthBuilding,
	getDataSolarMonth,
	getBillCompare,
};
