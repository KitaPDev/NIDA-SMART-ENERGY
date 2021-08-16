const targetService = require("../services/target.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function inputTarget(req, res) {
	try {
		let body = req.body;
		let month = body.month;
		let year = body.year;
		let buildingID = body.building_id;
		let electricityBill = body.electricity_bill;
		let amountPeople = body.amount_people;
		let tariff = body.tariff;

		if (!month && !year && !buildingID) {
			return res
				.status(httpStatusCodes.FORBIDDEN)
				.send("Please provide month and year.");
		}

		if (await targetService.targetExists(buildingID, month, year)) {
			await targetService.updateTarget(
				buildingID,
				month,
				year,
				electricityBill,
				amountPeople,
				tariff
			);
		} else {
			await targetService.insertTarget(
				buildingID,
				month,
				year,
				electricityBill,
				amountPeople,
				tariff
			);
		}

		return res.sendStatus(httpStatusCodes.OK);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getAllTargetByMonthYear(req, res) {
	try {
		let body = req.body;
		let month = body.month;
		let year = body.year;

		let lsTarget = await targetService.getAllTargetByMonthYear(month, year);

		return res.status(httpStatusCodes.OK).send(lsTarget);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getAllBuildingTariffByMonthYear(req, res) {
	try {
		let body = req.body;
		let month = body.month;
		let year = body.year;

		let lsTarget = await targetService.getAllTargetByMonthYear(month, year);

		let tariff_building = {};
		for (let target of lsTarget) {
			tariff_building[target.building] = target.tariff;
		}

		return res.status(httpStatusCodes.OK).send(tariff_building);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getBuildingTargetRange(req, res) {
	try {
		let body = req.body;
		let yearFrom = body.year_from;
		let monthFrom = body.month_from;
		let yearTo = body.year_to;
		let monthTo = body.month_to;
		let buildingID = body.building_id;

		let result = await targetService.getBuildingTargetRange(
			buildingID,
			yearFrom,
			monthFrom,
			yearTo,
			monthTo
		);

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = {
	inputTarget,
	getAllTargetByMonthYear,
	getAllBuildingTariffByMonthYear,
	getBuildingTargetRange,
};
