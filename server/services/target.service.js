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
	amountPeople
) {
	await knex(knex.ref("target")).insert({
		building_id: buildingID,
		month: month,
		year: year,
		electricity_bill: electricityBill,
		amount_people: amountPeople,
	});
}

async function updateTarget(
	buildingID,
	month,
	year,
	electricityBill,
	amountPeople,
	tariff
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
			});
	}
}

async function getAllTargetByMonthYear(month, year) {
	let result = await knex("target")
		.join("building", "target.building_id", "=", "building.id")
		.select(
			"target.id",
			"building.label as building",
			"target.electricity_bill",
			"target.amount_people",
			"target.tariff"
		)
		.where({ month: month, year: year });

	return result;
}

module.exports = {
	getBuildingPeople,
	targetExists,
	insertTarget,
	updateTarget,
	getAllTargetByMonthYear,
};
