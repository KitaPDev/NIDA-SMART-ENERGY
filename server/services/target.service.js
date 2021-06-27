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

	return result[0] !== 0;
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
	amountPeople
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
			});
	} else if (electricityBill !== undefined) {
		await knex(knex.ref("target"))
			.where({
				building_id: buildingID,
				month: month,
				year: year,
			})
			.update({
				electricity_bill: electricityBill,
			});
	} else if (amountPeople !== undefined) {
		await knex(knex.ref("target"))
			.where({
				building_id: buildingID,
				month: month,
				year: year,
			})
			.update({
				amount_people: amountPeople,
			});
	}
}

module.exports = {
	getBuildingPeople,
	targetExists,
	insertTarget,
	updateTarget,
};
