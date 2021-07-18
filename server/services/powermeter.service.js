const knex = require("../database").knex;

async function getLogPowerMeterByDatetime(start, end) {
	let result = await knex("log_power_meter")
		.select()
		.whereBetween("data_datetime", [start, end]);

	return result;
}

async function getAllLogPowerMeterDesc() {
	let result = await knex("log_power_meter").orderBy("data_datetime", "desc");

	return result;
}

async function insertLogPowerMeter(data) {
	await knex("log_power_meter").insert(data);
}

async function getLatestLogPowerMeter() {
	let result = await knex("log_power_meter")
		.orderBy("data_datetime", "desc")
		.first();

	return result;
}

module.exports = {
	getLogPowerMeterByDatetime,
	getAllLogPowerMeterDesc,
	insertLogPowerMeter,
	getLatestLogPowerMeter,
};
