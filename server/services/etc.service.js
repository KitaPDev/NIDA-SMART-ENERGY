const knex = require("../database").knex;

async function getVisitors() {
	let result = await knex("etc").select().where("id", "=", "visitors");
	return result[0].value;
}

async function incrementVisitors() {
	let visitors = +(await getVisitors());
	visitors++;

	await knex("etc").update({ value: visitors }).where("id", "=", "visitors");
}

module.exports = {
	getVisitors,
	incrementVisitors,
};
