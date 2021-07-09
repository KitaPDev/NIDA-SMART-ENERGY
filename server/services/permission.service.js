const knex = require("../database").knex;

async function getAllPermission() {
	let result = await knex("permission").select();
}

async function getAllUserTypePermission() {
	let result = await knex("user_type_permission").select();

	return result;
}

module.exports = {
	getAllUserTypePermission,
	getAllPermission,
};
