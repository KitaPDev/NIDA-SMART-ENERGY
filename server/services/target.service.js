const knex = require("../database").knex;
const dateFormatter = require("../utils/dateFormatter");

async function getBuildingPeople(month, year) {
	let result = await knex(knex.ref("target"))
		.select("building_id", "amount_people")
		.where({
			month: month,
			year: year,
		});

	return result;
}

async function targetExists(buildingID, month, year) {
	let result = await knex(knex.ref("target"))
		.where({
			building_id: buildingID,
			month: month,
			year: year,
		})
		.count("* as count");

	return result[0].count !== 0;
}

async function insertTarget(
	buildingID,
	month,
	year,
	electricityBill,
	amountPeople,
	tariff,
	energyUsage
) {
	await knex(knex.ref("target")).insert({
		building_id: buildingID,
		month: month,
		year: year,
		electricity_bill: electricityBill,
		amount_people: amountPeople,
		tariff: tariff,
		energy_usage: energyUsage,
	});
}

async function updateTarget(
	buildingID,
	month,
	year,
	electricityBill,
	amountPeople,
	tariff,
	energyUsage
) {
	await knex(knex.ref("target"))
		.where({
			building_id: buildingID,
			month: month,
			year: year,
		})
		.update({
			electricity_bill: electricityBill,
			amount_people: amountPeople,
			tariff: tariff,
			energy_usage: energyUsage,
		});
}

async function getAllTargetByMonthYear(month, year) {
	let result = await knex("target")
		.join("building", "target.building_id", "=", "building.id")
		.select(
			"target.id",
			"target.month",
			"target.year",
			"building.label as building",
			"target.electricity_bill",
			"target.amount_people",
			"target.tariff",
			"target.energy_usage"
		)
		.where({ month: month, year: year });

	return result;
}

async function getBuildingTargetRange(
	buildingID,
	yearFrom,
	monthFrom,
	yearTo,
	monthTo
) {
	let result = await knex("target")
		.join("building", "target.building_id", "=", "building.id")
		.select(
			"target.id",
			"target.month",
			"target.year",
			"building.label as building",
			"target.electricity_bill",
			"target.amount_people",
			"target.tariff",
			"target.energy_usage"
		)
		.where("building_id", "=", buildingID)
		.andWhere("year", ">=", yearFrom)
		.andWhere("month", ">=", monthFrom)
		.andWhere("year", "<=", yearTo)
		.andWhere("month", "<=", monthTo);

	return result;
}

async function getTargetPresetData(buildingID, month, year) {
	let data = {
		lsTarget: [],
		lsLog: [],
	};

	data.lsTarget = await knex("target")
		.join("building", "target.building_id", "=", "building.id")
		.select(
			"target.id",
			"target.month",
			"target.year",
			"building.label as building",
			"target.electricity_bill",
			"target.amount_people",
			"target.tariff",
			"target.energy_usage"
		)
		.where("building_id", "=", buildingID)
		.andWhere("month", "=", month)
		.andWhere(function () {
			this.where("year", "=", year).orWhere("year", "=", year - 1);
		});

	data.lsLog = await knex("log_power_meter")
		.join("device", "log_power_meter.device_id", "=", "device.id")
		.join("building", "device.building_id", "=", "building.id")
		.join("system", "device.system_id", "=", "system.id")
		.select(
			"log_power_meter.data_datetime",
			"device.id as device",
			"log_power_meter.kwh",
			"system.label as system"
		)
		.where(function () {
			let y = year;
			let m = month;
			for (let i = 0; i < 13; i++) {
				if (m < 0) {
					y--;
					m += 12;
				}

				let dateStart_before = new Date(y, m, 1, 0, 0);
				let dateStart_after = new Date(y, m, 1, 10, 0);
				let dateEnd_after = new Date(y, m + 1, 0, 0, 0);
				let dateEnd_before = new Date(dateEnd_after.getTime() - 36000000);

				this.orWhereBetween("log_power_meter.data_datetime", [
					dateFormatter.yyyymmddhhmmss(dateStart_before),
					dateFormatter.yyyymmddhhmmss(dateStart_after),
				]).orWhereBetween("log_power_meter.data_datetime", [
					dateFormatter.yyyymmddhhmmss(dateEnd_before),
					dateFormatter.yyyymmddhhmmss(dateEnd_after),
				]);

				if (i === 0) {
					for (j = 2; j <= 3; j++) {
						ds_before = new Date(y - j, m, 1, 0, 0);
						ds_after = new Date(y - j, m, 1, 10, 0);
						de_after = new Date(y - j, m + 1, 0, 0, 0);
						de_before = new Date(dateEnd_after.getTime() - 36000000);

						this.orWhereBetween("log_power_meter.data_datetime", [
							dateFormatter.yyyymmddhhmmss(ds_before),
							dateFormatter.yyyymmddhhmmss(ds_after),
						]).orWhereBetween("log_power_meter.data_datetime", [
							dateFormatter.yyyymmddhhmmss(de_before),
							dateFormatter.yyyymmddhhmmss(de_after),
						]);
					}
				}
				m--;
			}
		})
		.andWhere("device.building_id", "=", buildingID)
		.andWhere("system.label", "=", "Main")
		.whereNull("device.floor");

	return data;
}

module.exports = {
	getBuildingPeople,
	targetExists,
	insertTarget,
	updateTarget,
	getAllTargetByMonthYear,
	getBuildingTargetRange,
	getTargetPresetData,
};
