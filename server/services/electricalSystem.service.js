const knex = require("../database").knex;

async function getAllElectricalSystem(from, to) {
	let result = await knex("electrical_system").select("id", "label");

	return result;
}

module.exports = {
	getAllElectricalSystem,
};
