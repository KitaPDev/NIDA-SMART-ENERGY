const targetService = require("../services/target.service");
const buildingService = require("../services/building.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;
const { response } = require("express");

async function inputTarget(req, res) {
	try {
		let body = req.body;
		let month = body.month;
		let year = body.year;
		let buildingID = body.building_id;
		let electricityBill = body.electricity_bill;
		let amountPeople = body.amount_people;
		let coefficientElectricityCost = body.coefficient_electricity_cost;

		if (!month && !year && !buildingID) {
			return res
				.status(httpStatusCodes.FORBIDDEN)
				.send("Please provide month and year.");
		}

		if (targetService.targetExists(buildingID, month, year)) {
			await targetService.updateTarget(
				buildingID,
				month,
				year,
				electricityBill,
				amountPeople,
				coefficientElectricityCost
			);
		} else {
			await targetService.insertTarget(
				buildingID,
				month,
				year,
				electricityBill,
				amountPeople,
				coefficientElectricityCost
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

async function getAllBuildingCostCoefficientByMonthYear(req, res) {
	try {
		let body = req.body;
		let month = body.month;
		let year = body.year;

		let lsTarget = await targetService.getAllTargetByMonthYear(month, year);

		let costCoef_building = {};
		for (let target of lsTarget) {
			costCoef_building[target.building] = target.coefficient_electricity_cost;
		}

		return res.status(httpStatusCodes.OK).send(costCoef_building);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = {
	inputTarget,
	getAllTargetByMonthYear,
	getAllBuildingCostCoefficientByMonthYear,
};
