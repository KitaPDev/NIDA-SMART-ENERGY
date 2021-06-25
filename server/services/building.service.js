const knex = require("../database").knex;

async function getAllBuildings() {
	let result = await knex(knex.ref("building")).select();
	return result;
}

module.exports = { getAllBuildings };
