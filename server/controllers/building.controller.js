const buildingService = require("../services/building.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function getAll(req, res) {
	try {
		let lsBuilding = await buildingService.getAllBuilding();
		lsBuilding.sort((a, b) =>
			a.label > b.label ? 1 : b.label > a.label ? -1 : 0
		);
		return res.status(httpStatusCodes.OK).send(lsBuilding);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getData(req, res) {
	try {
		let body = req.body;
		let buildingID = body.building_id;
		let dateFrom = body.date_from;
		let dateTo = body.date_to;

		let result = await buildingService.getData(buildingID, dateFrom, dateTo);

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getBillCompare(req, res) {
	try {
		let body = req.body;
		let buildingID = body.building_id;

		let data = await buildingService.getBillCompareData(buildingID);

		let bill_month = {};

		let bill_year_month = {};
		let lsLog_year_month = data.lsLog_year_month;
		let lsTarget = data.lsTarget;
		let today = new Date();

		for (let month = 1; month <= 12; month++) {
			bill_month[month] = {};

			bill_year_month[month] = {};
			let bill_year = bill_year_month[month];

			// Calculate bill of each month of each year from list of logs.
			let lsLog_year = lsLog_year_month[month];
			for (let [year, lsLog] of Object.entries(lsLog_year)) {
				bill_year = bill_year_month[month];

				let lsPrevDevice = [];
				for (let log of lsLog.slice().reverse()) {
					let kwh = log.kwh;

					if (
						log.system !== "Main" ||
						lsPrevDevice.includes(log.device) ||
						kwh === null
					) {
						continue;
					}

					if (!bill_year[year]) bill_year[year] = 0;
					bill_year[year] += kwh;

					lsPrevDevice.push(log.device);
				}

				lsPrevDevice = [];
				for (let log of lsLog) {
					let kwh = log.kwh;

					if (
						log.system !== "Main" ||
						lsPrevDevice.includes(log.device) ||
						kwh === null
					) {
						continue;
					}

					bill_year[year] -= kwh;
					lsPrevDevice.push(log.device);
				}

				let tariff = 4;
				let target = lsTarget.find((target) => {
					if (target !== undefined) {
						target.month === month && target.year === year;
					}
				});
				if (target !== undefined) {
					tariff = target.tariff;
				}

				if (bill_year[year] === undefined) bill_year[year] = 0;
				bill_year[year] *= tariff;
			}
		}

		// Calculate data from bill
		let month = today.getMonth() + 1;
		let year = today.getFullYear();
		for (let i = 0; i < 12; i++) {
			if (month < 1) {
				month += 12;
				year--;
			}

			// Current month and year bill
			bill_month[month].latest = bill_year_month[month][year];

			// Last year's bill
			bill_month[month].lastYear = bill_year_month[month][year - 1];

			// Target bill
			let targetBill = 0;
			let target = lsTarget.find((t) => {
				if (t !== undefined) {
					return t.month === month && t.year === year;
				}
			});
			if (target !== undefined) targetBill = target.electricity_bill;
			if (targetBill === null) targetBill = 0;
			bill_month[month].target = targetBill;

			// Average Bill over past 3 years
			for (let j = 1; j <= 3; j++) {
				if (bill_month[month].average === undefined) {
					bill_month[month].average = 0;
				}
				bill_month[month].average += bill_year_month[month][year - j];
			}

			bill_month[month].average /= 3;
			month--;
		}

		return res.status(httpStatusCodes.OK).send(bill_month);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = {
	getAll,
	getData,
	getBillCompare,
};
