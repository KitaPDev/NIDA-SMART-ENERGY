const buildingService = require("../services/building.service");
const targetService = require("../services/target.service");
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

		let billData_month = {};

		let bill_year_month = {};
		let lsLog_year_month = data.lsLog_year_month;
		let lsTarget = data.lsTarget;
		let today = new Date();

		for (let month = 0; month <= 11; month++) {
			billData_month[month] = {};

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

					let tariff = 4;
					let target = lsTarget.find((target) => {
						if (target !== undefined) {
							return (
								target.month === month &&
								target.year === year &&
								target.building === log.building
							);
						}
					});
					if (target !== undefined) tariff = target.tariff;

					if (!bill_year[year]) bill_year[year] = 0;
					bill_year[year] += kwh * tariff;

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

					let tariff = 4;
					let target = lsTarget.find((target) => {
						if (target !== undefined) {
							return (
								target.month === month &&
								target.year === year &&
								target.building === log.building
							);
						}
					});
					if (target !== undefined) tariff = target.tariff;

					bill_year[year] -= kwh * tariff;
					lsPrevDevice.push(log.device);
				}
			}
		}

		// Calculate data from bill
		let month = today.getMonth();
		let year = today.getFullYear();
		for (let i = 0; i < 12; i++) {
			if (month < 0) {
				month += 12;
				year--;
			}

			// Current month and year bill
			billData_month[month].latest = 0;
			if (bill_year_month[month][year] !== undefined) {
				billData_month[month].latest = bill_year_month[month][year];
			}

			// Last year's bill
			billData_month[month].lastYear = 0;
			if (bill_year_month[month][year - 1] !== undefined) {
				billData_month[month].lastYear = bill_year_month[month][year - 1];
			}

			// Target bill
			let targetBill = 0;
			lsTarget.forEach((t) => {
				if (t.month === month && t.year === year) {
					if (t.electricity_bill !== null) targetBill += t.electricity_bill;
				}
			});
			billData_month[month].target = targetBill;

			// Average Bill over past 3 years
			for (let j = 1; j <= 3; j++) {
				if (billData_month[month].average === undefined) {
					billData_month[month].average = 0;
				}
				if (bill_year_month[month][year - j] !== undefined) {
					billData_month[month].average += bill_year_month[month][year - j];
				}
			}

			billData_month[month].average /= 3;
			month--;
		}

		return res.status(httpStatusCodes.OK).send(billData_month);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getEnergyUsageDatetime(req, res) {
	try {
		let body = req.body;
		let lsBuildingID = body.ls_building_id;
		let dateFrom = new Date(body.date_from);
		let dateTo = new Date(body.date_to);

		let result = await buildingService.getEnergyUsageDatetime(
			lsBuildingID,
			dateFrom,
			dateTo
		);

		let kwh_system_building = {};

		let lsPrevDevice = [];
		for (let row of result) {
			let building = row.building;
			let kwh = row.kwh;
			let system = row.system;
			let device = row.device;

			if (lsPrevDevice.includes(device) || kwh === null) continue;
			lsPrevDevice.push(device);

			if (!kwh_system_building[building]) kwh_system_building[building] = {};
			if (!kwh_system_building[building][system]) {
				kwh_system_building[building][system] = 0;
			}

			kwh_system_building[building][system] += kwh;
		}

		lsPrevDevice = [];
		for (let row of result.slice().reverse()) {
			let building = row.building;
			let kwh = row.kwh;
			let system = row.system;
			let device = row.device;

			if (lsPrevDevice.includes(device) || kwh === null) continue;
			lsPrevDevice.push(device);

			kwh_system_building[building][system] -= kwh;
		}

		return res.status(httpStatusCodes.OK).send(kwh_system_building);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getElectricityBillDatetime(req, res) {
	try {
		let body = req.body;
		let lsBuildingID = body.ls_building_id;
		let dateFrom = new Date(body.date_from);
		let dateTo = new Date(body.date_to);

		let result = await buildingService.getEnergyUsageDatetime(
			lsBuildingID,
			dateFrom,
			dateTo
		);

		let lsTarget = await targetService.getAllTarget_lsBuildingID_period(
			lsBuildingID,
			dateFrom,
			dateTo
		);

		let bill_system_building = {};

		let lsPrevDevice = [];
		for (let row of result) {
			let datetime = row.data_datetime;
			let building = row.building;
			let kwh = row.kwh;
			let system = row.system;
			let device = row.device;

			if (lsPrevDevice.includes(device) || kwh === null) continue;
			lsPrevDevice.push(device);

			if (!bill_system_building[building]) bill_system_building[building] = {};
			if (!bill_system_building[building][system]) {
				bill_system_building[building][system] = 0;
			}

			let tariff = 4;
			let target = lsTarget.find(
				(t) =>
					t.month === datetime.getMonth() &&
					t.year === datetime.getFullYear() &&
					t.building === building
			);
			if (target) if (target.tariff !== null) tariff = target.tariff;

			bill_system_building[building][system] += kwh * tariff;
		}

		lsPrevDevice = [];
		for (let row of result.slice().reverse()) {
			let datetime = row.data_datetime;
			let building = row.building;
			let kwh = row.kwh;
			let system = row.system;
			let device = row.device;

			if (lsPrevDevice.includes(device) || kwh === null) continue;
			lsPrevDevice.push(device);

			let tariff = 4;
			let target = lsTarget.find(
				(t) =>
					t.month === datetime.getMonth() &&
					t.year === datetime.getFullYear() &&
					t.building === building
			);
			if (target) if (target.tariff !== null) tariff = target.tariff;

			bill_system_building[building][system] -= kwh * tariff;
		}

		return res.status(httpStatusCodes.OK).send(bill_system_building);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getElectricityBillMonthYear(req, res) {
	try {
		let body = req.body;
		let lsBuildingID = body.ls_building_id;
		let dateFrom = new Date(body.date_from);
		let dateTo = new Date(body.date_to);

		let result = await buildingService.getDataBuildingMonthYear(
			lsBuildingID,
			dateFrom,
			dateTo
		);

		let lsTarget = await targetService.getAllTarget_lsBuildingID_period(
			lsBuildingID,
			dateFrom,
			dateTo
		);

		let bill_building_month_year = {};

		let lsPrevDevice = [];
		for (let row of result) {
			let datetime = row.data_datetime;
			let building = row.building;
			let kwh = row.kwh;
			let device = row.device;

			let m = datetime.getMonth();
			let y = datetime.getFullYear();

			if (!bill_building_month_year[y]) {
				bill_building_month_year[y] = {};
			}

			if (!bill_building_month_year[y][m]) {
				bill_building_month_year[y][m] = {};
				lsPrevDevice = [];
			}

			if (!bill_building_month_year[y][m][building]) {
				bill_building_month_year[y][m][building] = 0;
			}

			if (lsPrevDevice.includes(device) || kwh === null) continue;
			lsPrevDevice.push(device);

			let tariff = 4;
			let target = lsTarget.find(
				(t) =>
					t.month === datetime.getMonth() &&
					t.year === datetime.getFullYear() &&
					t.building === building
			);
			if (target) if (target.tariff !== null) tariff = target.tariff;

			bill_building_month_year[y][m][building] += kwh * tariff;
		}

		lsPrevDevice = [];
		let prevMonth;
		let prevDatetime;
		for (let row of result.slice().reverse()) {
			let datetime = row.data_datetime;
			let building = row.building;
			let kwh = row.kwh;
			let device = row.device;

			let m = datetime.getMonth();
			let y = datetime.getFullYear();

			if (prevMonth === undefined) {
				prevMonth = m;
			}

			if (prevMonth !== m && datetime.getTime() < prevDatetime.getTime()) {
				prevMonth = m;
				lsPrevDevice = [];
			}
			prevDatetime = datetime;

			if (lsPrevDevice.includes(device) || kwh === null) continue;
			lsPrevDevice.push(device);

			let tariff = 4;
			let target = lsTarget.find(
				(t) =>
					t.month === datetime.getMonth() &&
					t.year === datetime.getFullYear() &&
					t.building === building
			);
			if (target) if (target.tariff !== null) tariff = target.tariff;

			bill_building_month_year[y][m][building] -= kwh * tariff;
		}

		return res.status(httpStatusCodes.OK).send(bill_building_month_year);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getPowerIaqDatetime(req, res) {
	try {
		let body = req.body;
		let lsBuildingID = body.ls_building_id;
		let dateFrom = new Date(body.date_from);
		let dateTo = new Date(body.date_to);

		let result = await buildingService.getPowerIaqDatetime(
			lsBuildingID,
			dateFrom,
			dateTo
		);

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = {
	getAll,
	getData,
	getBillCompare,
	getEnergyUsageDatetime,
	getElectricityBillDatetime,
	getElectricityBillMonthYear,
	getPowerIaqDatetime,
};
