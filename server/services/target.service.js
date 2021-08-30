const knex = require("../database").knex;

async function getBuildingPeople(month, year) {
	let result = await knex(knex.ref("target"))
		.select("building_id", "amount_people")
		.where({
			month: month,
			year: year,
		});

	return result;
}

async function targetExists(buildingID, month, year) {
	let result = await knex(knex.ref("target"))
		.where({
			building_id: buildingID,
			month: month,
			year: year,
		})
		.count("* as count");

	return result[0].count !== 0;
}

async function insertTarget(
	buildingID,
	month,
	year,
	electricityBill,
	amountPeople,
	tariff,
	energyUsage
) {
	await knex(knex.ref("target")).insert({
		building_id: buildingID,
		month: month,
		year: year,
		electricity_bill: electricityBill,
		amount_people: amountPeople,
		tariff: tariff,
		energyUsage: energyUsage,
	});
}

async function updateTarget(
	buildingID,
	month,
	year,
	electricityBill,
	amountPeople,
	tariff,
	energyUsage
) {
	if (electricityBill !== undefined && amountPeople !== undefined) {
		await knex(knex.ref("target"))
			.where({
				building_id: buildingID,
				month: month,
				year: year,
			})
			.update({
				electricity_bill: electricityBill,
				amount_people: amountPeople,
				tariff: tariff,
				energyUsage: energyUsage,
			});
	}
}

async function getAllTargetByMonthYear(month, year) {
	let result = await knex("target")
		.join("building", "target.building_id", "=", "building.id")
		.select(
			"target.id",
			"target.month",
			"target.year",
			"building.label as building",
			"target.electricity_bill",
			"target.amount_people",
			"target.tariff"
		)
		.where({ month: month, year: year });

	return result;
}

async function getBuildingTargetRange(
	buildingID,
	yearFrom,
	monthFrom,
	yearTo,
	monthTo
) {
	let result = await knex("target")
		.join("building", "target.building_id", "=", "building.id")
		.select(
			"target.id",
			"target.month",
			"target.year",
			"building.label as building",
			"target.electricity_bill",
			"target.amount_people",
			"target.tariff",
			"target.energy_usage"
		)
		.where("building_id", "=", buildingID)
		.andWhere("year", ">=", yearFrom)
		.andWhere("month", ">=", monthFrom)
		.andWhere("year", "<=", yearTo)
		.andWhere("month", "<=", monthTo);

	return result;
}

async function getTargetPresetData(buildingID, month, year) {
	let data = {
		lsTarget: [],
		lsLog: [],
	};

	data.lsTarget = await knex("target")
		.join("building", "target.building_id", "=", "building.id")
		.select(
			"target.id",
			"target.month",
			"target.year",
			"building.label as building",
			"target.electricity_bill",
			"target.amount_people",
			"target.tariff",
			"target.energy_usage"
		)
		.where("building_id", "=", buildingID)
		.andWhere("month", "=", month)
		.andWhereBetween("year", [year, year - 3]);

	data.lsLog = await knex("log_power_meter").join();

	return data;
}

module.exports = {
	getBuildingPeople,
	targetExists,
	insertTarget,
	updateTarget,
	getAllTargetByMonthYear,
	getBuildingTargetRange,
	getTargetPresetData,
};
