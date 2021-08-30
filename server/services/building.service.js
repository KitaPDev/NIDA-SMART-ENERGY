const knex = require("../database").knex;
const dateFormatter = require("../utils/dateFormatter");

async function getAllBuilding() {
	let result = await knex(knex.ref("building")).select();
	return result;
}

async function getData(buildingID, dateFrom, dateTo) {
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
			dateFormatter.yyyymmddhhmmss(new Date(dateFrom))
		)
		.andWhere(
			"log_power_meter.data_datetime",
			"<=",
			dateFormatter.yyyymmddhhmmss(new Date(dateTo))
		)
		.andWhere("building.id", "=", buildingID)
		.andWhere(knex.raw(`MINUTE(data_datetime) % 15 = 0`))
		.orderBy("log_power_meter.data_datetime", "asc");

	return result;
}

async function getBillCompareData(buildingID) {
	let today = new Date();

	let data = {};

	data.lsTarget = [];
	data.lsLog_year_month = {};

	let month = today.getMonth();
	let year = today.getFullYear();
	for (let i = 0; i < 12; i++) {
		if (month < 0) {
			month += 12;
			year--;
		}

		data.lsLog_year_month[month] = {};

		let firstDay = new Date(year, month, 1, 0, 0);
		let lastDay = new Date(year, month, 0, 24);

		// For current month when now is not last day of month.
		if (i === 0) lastDay = new Date();

		let dateStart_before = firstDay;
		let dateStart_after = new Date(firstDay.getTime() + 43200000); // 12 Hours after beginning of first day.
		let dateEnd_before = new Date(lastDay.getTime() - 43200000); // 12 Hours before beginning of last day.
		let dateEnd_after = lastDay;

		// Average
		for (let j = 0; j <= 3; j++) {
			let ds_before = new Date(dateStart_before);
			ds_before.setFullYear(dateStart_before.getFullYear() - j);
			let ds_after = new Date(dateStart_after);
			ds_after.setFullYear(dateStart_after.getFullYear() - j);

			let de_before = new Date(dateEnd_before);
			de_before.setFullYear(dateEnd_before.getFullYear() - j);
			let de_after = new Date(dateEnd_after);
			de_after.setFullYear(dateEnd_after.getFullYear() - j);

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
				.where(function () {
					if (Array.isArray(buildingID)) {
						this.whereIn("building.id", buildingID);
					} else {
						this.where("building.id", "=", buildingID);
					}
				})
				.andWhere(function () {
					this.whereBetween("log_power_meter.data_datetime", [
						dateFormatter.yyyymmddhhmmss(ds_before),
						dateFormatter.yyyymmddhhmmss(ds_after),
					]).orWhereBetween("log_power_meter.data_datetime", [
						dateFormatter.yyyymmddhhmmss(de_before),
						dateFormatter.yyyymmddhhmmss(de_after),
					]);
				});

			data.lsLog_year_month[month][year - j] = result;

			// Target
			result = await knex("target")
				.select()
				.where({
					month: month,
					year: year - j,
				})
				.andWhere(function () {
					if (Array.isArray(buildingID)) {
						this.whereIn("building_id", buildingID);
					} else {
						this.where("building_id", "=", buildingID);
					}
				});

			if (result[0] !== undefined) data.lsTarget.push(result[0]);
		}

		month--;
	}

	return data;
}

module.exports = {
	getAllBuilding,
	getData,
	getBillCompareData,
};
