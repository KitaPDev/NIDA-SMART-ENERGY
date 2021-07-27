const knex = require("../database").knex;

async function getAllSystem(from, to) {
	let result = await knex("system").select("id", "label");

	return result;
}

module.exports = {
	getAllSystem,
};
