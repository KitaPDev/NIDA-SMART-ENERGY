const knex = require("../database").knex;
const dateFormatter = require("../utils/dateFormatter");

async function getLogPowerMeterByDatetime(start, end) {
	let result = await knex("log_power_meter")
		.select()
		.whereBetween("data_datetime", [start, end])
		.andWhere(knex.raw(`MINUTE(data_datetime) % 15 = 0`));
	return result;
}

async function getAllLogPowerMeterDesc() {
	let result = await knex("log_power_meter")
		.orderBy("data_datetime", "desc")
		.where(knex.raw(`MINUTE(data_datetime) % 15 = 0`));

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
		.andWhere(knex.raw(`MINUTE(data_datetime) % 15 = 0`))
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
		.andWhere(knex.raw(`MINUTE(data_datetime) % 15 = 0`))
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
		.andWhere(knex.raw(`MINUTE(data_datetime) % 15 = 0`))
		.orderBy("data_datetime", "asc");

	return result;
}

async function getDataPowerMonth(month) {
	let today = new Date();

	let dateStart_before = new Date(today.getFullYear(), month, 1, 0, 0);
	let dateStart_after = new Date(today.getFullYear(), month, 1, 12, 0);
	let dateEnd_before = new Date(today.getTime() - 43200000); // 12 Hours before end of month

	let result = await knex("log_power_meter")
		.join("device", "log_power_meter.device_id", "=", "device.id")
		.join("building", "device.building_id", "=", "building.id")
		.join("system", "device.system_id", "=", "system.id")
		.select(
			"log_power_meter.data_datetime",
			"building.label as building",
			"device.id as device",
			"log_power_meter.kwh",
			"system.label as system"
		)
		.whereBetween("log_power_meter.data_datetime", [
			dateFormatter.yyyymmddhhmmss(dateStart_before),
			dateFormatter.yyyymmddhhmmss(dateStart_after),
		])
		.orWhere(
			"log_power_meter.data_datetime",
			">",
			dateFormatter.yyyymmddhhmmss(dateEnd_before)
		);

	return result;
}

async function getDataSolarMonth(month) {
	let today = new Date();

	let dateStart_after = new Date(today.getFullYear(), month, 1, 12, 0);
	let dateStart_before = new Date(today.getFullYear(), month, 1, 0, 0);
	let dateEnd_before = new Date(today.getTime() - 1800000);

	let result = await knex("log_solar")
		.select("data_datetime", "kwh")
		.where((builder) =>
			builder.whereBetween("data_datetime", [
				dateFormatter.yyyymmddhhmmss(dateStart_before),
				dateFormatter.yyyymmddhhmmss(dateStart_after),
			])
		)
		.orWhere(
			"data_datetime",
			">",
			dateFormatter.yyyymmddhhmmss(dateEnd_before)
		);

	return result;
}

async function getBillCompareData(dateFrom, dateTo) {
	let data = {};

	let from = new Date(dateFrom);
	let to = new Date(dateTo);

	data.lsTarget = [];
	data.lsLog_date_month_year = {};

	for (let i = 0; i <= 3; i++) {
		from.setFullYear(dateFrom.getFullYear() - i);
		to.setFullYear(dateTo.getFullYear() - i);

		let start = new Date(
			from.getFullYear(),
			from.getMonth(),
			from.getDate(),
			0,
			0
		);
		let end = new Date(
			to.getFullYear(),
			to.getMonth(),
			to.getDate(),
			23,
			59,
			59
		);

		let result = await knex("log_power_meter")
			.join("device", "log_power_meter.device_id", "=", "device.id")
			.join("building", "device.building_id", "=", "building.id")
			.join("system", "device.system_id", "=", "system.id")
			.select(
				"log_power_meter.data_datetime",
				"building.label as building",
				"device.id as device",
				"log_power_meter.kwh",
				"system.label as system"
			)
			.whereBetween("log_power_meter.data_datetime", [
				dateFormatter.yyyymmddhhmmss(start),
				dateFormatter.yyyymmddhhmmss(end),
			]);

		let dateCurrent = new Date(start);
		while (dateCurrent.getTime() < end.getTime()) {
			let year = dateCurrent.getFullYear();
			let month = dateCurrent.getMonth();
			let date = dateCurrent.getDate();

			if (data.lsLog_date_month_year[year] === undefined)
				data.lsLog_date_month_year[year] = {};
			let lsLog_date_month = data.lsLog_date_month_year[year];

			if (lsLog_date_month[month] === undefined) lsLog_date_month[month] = {};
			let lsLog_date = lsLog_date_month[month];

			if (lsLog_date[date] === undefined) lsLog_date[date] = [];
			let lsLog = lsLog_date[date];

			for (let row of result) {
				let datetime = new Date(row.data_datetime);

				if (
					datetime.getFullYear() === year &&
					datetime.getMonth() === month &&
					datetime.getDate() === date
				) {
					lsLog.push(row);
				}
			}

			dateCurrent = new Date(dateCurrent.getTime() + 86400000);
		}

		result = await knex("target")
			.join("building", "target.building_id", "=", "building.id")
			.select(
				"building.label as building",
				"month",
				"year",
				"electricity_bill",
				"amount_people",
				"tariff"
			)
			.where({
				month: from.getMonth(),
				year: from.getFullYear() - i,
			});

		if (result.length > 0) result.forEach((row) => data.lsTarget.push(row));
	}

	return data;
}

async function getEnergy() {
	let today = new Date();
	let yesterdayStart = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate() - 1,
		0,
		0
	);
	let yesterdayEnd = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate() - 1,
		23,
		59
	);

	let monthLastYearBefore_start = new Date(
		today.getFullYear() - 1,
		today.getMonth(),
		1,
		0,
		0
	);

	let monthLastYearBefore_end = new Date(
		today.getFullYear() - 1,
		today.getMonth(),
		1,
		12,
		0
	);

	let monthLastYearAfter_start = new Date(
		today.getFullYear() - 1,
		today.getMonth() + 1,
		0,
		0,
		0
	);

	let monthLastYearAfter_end = new Date(
		monthLastYearAfter_start.getTime() - 43200000
	);

	let result = await knex("log_power_meter")
		.join("device", "log_power_meter.device_id", "=", "device.id")
		.join("building", "device.building_id", "=", "building.id")
		.join("system", "device.system_id", "=", "system.id")
		.select(
			"log_power_meter.data_datetime",
			"building.label as building",
			"device.id as device",
			"log_power_meter.kwh",
			"system.label as system"
		)
		.where((builder) =>
			builder
				.whereBetween("data_datetime", [
					dateFormatter.yyyymmddhhmmss(yesterdayStart),
					dateFormatter.yyyymmddhhmmss(yesterdayEnd),
				])
				.orWhereBetween("data_datetime", [
					dateFormatter.yyyymmddhhmmss(monthLastYearBefore_start),
					dateFormatter.yyyymmddhhmmss(monthLastYearBefore_end),
				])
				.orWhereBetween("data_datetime", [
					dateFormatter.yyyymmddhhmmss(monthLastYearAfter_start),
					dateFormatter.yyyymmddhhmmss(monthLastYearAfter_end),
				])
		)
		.andWhere("system.label", "=", "Main")
		.orderBy("log_power_meter.data_datetime", "DESC");
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
	getDataPowerMonth,
	getDataSolarMonth,
	getBillCompareData,
	getEnergy,
};
