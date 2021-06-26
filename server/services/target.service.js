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

module.exports = { getBuildingPeople };
