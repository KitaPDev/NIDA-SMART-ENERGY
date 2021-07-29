const knex = require("../database").knex;
const dateFormatter = require("../utils/dateFormatter");

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

async function insertLogIaq(data) {
	await knex("log_iaq").insert(data);
}

async function getLatestLogIaq() {
	let result = await knex("log_iaq").orderBy("data_datetime", "desc").first();

	return result;
}

async function insertLogSolar(data) {
	await knex("log_solar").insert(data);
}

async function getLatestLogSolar() {
	let result = await knex("log_solar").orderBy("data_datetime", "desc").first();

	return result;
}

async function getDataPowerMeter(start, end) {
	let result = await knex("log_power_meter")
		.join("device", "log_power_meter.device_id", "=", "device.id")
		.join("building", "device.building_id", "=", "building.id")
		.join("system", "device.system_id", "=", "system.id")
		.select(
			"log_power_meter.data_datetime",
			"building.label as building",
			"device.floor",
			"device.id as device",
			"system.label as system",
			"log_power_meter.kw_total as kw",
			"log_power_meter.kwh"
		)
		.where(
			"log_power_meter.data_datetime",
			">=",
			dateFormatter.yyyymmddhhmmss(new Date(start))
		)
		.andWhere(
			"log_power_meter.data_datetime",
			"<=",
			dateFormatter.yyyymmddhhmmss(new Date(end))
		)
		.orderBy("log_power_meter.data_datetime", "asc");

	return result;
}

async function getDataSolar(start, end) {
	let result = await knex("log_solar")
		.select("data_datetime", "device_id as device", "kw", "kwh")
		.where("data_datetime", ">=", dateFormatter.yyyymmddhhmmss(new Date(start)))
		.andWhere(
			"data_datetime",
			"<=",
			dateFormatter.yyyymmddhhmmss(new Date(end))
		)
		.orderBy("data_datetime", "asc");

	return result;
}

async function getDataIaq(start, end) {
	let result = await knex("log_iaq")
		.select("data_datetime", "device_id as device", "humidity", "temperature")
		.where("data_datetime", ">=", dateFormatter.yyyymmddhhmmss(new Date(start)))
		.andWhere(
			"data_datetime",
			"<=",
			dateFormatter.yyyymmddhhmmss(new Date(end))
		)
		.orderBy("data_datetime", "asc");

	return result;
}

module.exports = {
	getLogPowerMeterByDatetime,
	getAllLogPowerMeterDesc,
	insertLogPowerMeter,
	getLatestLogPowerMeter,
	insertLogIaq,
	getLatestLogIaq,
	insertLogSolar,
	getLatestLogSolar,
	getDataPowerMeter,
	getDataSolar,
	getDataIaq,
};
