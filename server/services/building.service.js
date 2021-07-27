const knex = require("../database").knex;

async function getAllBuilding() {
	let result = await knex(knex.ref("building")).select();
	return result;
}

module.exports = {
	getAllBuilding,
};
