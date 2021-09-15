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
		.andWhere(function () {
			this.where({
				year: year,
				month: month - 1,
			})
				.orWhere({
					year: year - 1,
					month: month,
				})
				.orWhere({});
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
			for (let i = 0; i <= 12; i++) {
				if (m < 0) {
					y--;
					m += 12;
				}

				let dateStart_before = new Date(y, m, 1, 0, 0);
				let dateStart_after = new Date(y, m, 1, 10, 0);
				let dateEnd_after = new Date(y, m + 1, 23, 59, 59);

				let today = new Date();
				if (
					today.getMonth() === dateEnd_after.getMonth() &&
					today.getFullYear() === dateEnd_after.getFullYear()
				) {
					dateEnd_after = today;
				}
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

async function getDataEnergyMonthPastYear() {
	let today = new Date();

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
			let y = today.getFullYear();
			let m = today.getMonth();
			for (let i = 0; i <= 12; i++) {
				if (m < 0) {
					y--;
					m += 12;
				}

				let dateStart_before = new Date(y, m, 1, 0, 0);
				let dateStart_after = new Date(y, m, 1, 12, 0);
				if (y === 2021 && m === 5) {
					dateStart_before = new Date(y, m, 22, 19, 35);
					dateStart_after = new Date(dateStart_before.getTime() + 43200000);
				}

				let dateEnd_after = new Date(y, m + 1, 0, 23, 59, 59);

				let today = new Date();
				if (
					today.getMonth() === dateEnd_after.getMonth() &&
					today.getFullYear() === dateEnd_after.getFullYear()
				) {
					dateEnd_after = today;
				}
				let dateEnd_before = new Date(dateEnd_after.getTime() - 43200000);

				this.orWhereBetween("log_power_meter.data_datetime", [
					dateFormatter.yyyymmddhhmmss(dateStart_before),
					dateFormatter.yyyymmddhhmmss(dateStart_after),
				]).orWhereBetween("log_power_meter.data_datetime", [
					dateFormatter.yyyymmddhhmmss(dateEnd_before),
					dateFormatter.yyyymmddhhmmss(dateEnd_after),
				]);

				m--;
			}
		})
		.orderBy("log_power_meter.data_datetime");

	lsLog_month = {};
	for (let row of result) {
		let datetime = new Date(row.data_datetime);
		let month = datetime.getMonth();

		if (lsLog_month[month] === undefined) {
			lsLog_month[month] = [];
		}

		lsLog_month[month].push(row);
	}

	return lsLog_month;
}

async function getAllTarget_lsBuildingID_period(lsBuildingID, start, end) {
	let lsTarget = await knex("target")
		.join("building", "target.building_id", "=", "building.id")
		.select(
			"target.id",
			"target.month",
			"target.year",
			"building.label as building",
			"target.electricity_bill",
			"target.tariff",
			"target.amount_people"
		)
		.whereIn("building.id", lsBuildingID)
		.andWhereBetween("target.year", [start.getFullYear(), end.getFullYear()])
		.andWhereBetween("target.month", [start.getMonth(), end.getMonth()]);

	return lsTarget;
}

module.exports = {
	getBuildingPeople,
	targetExists,
	insertTarget,
	updateTarget,
	getAllTargetByMonthYear,
	getBuildingTargetRange,
	getTargetPresetData,
	getDataEnergyMonthPastYear,
	getAllTarget_lsBuildingID_period,
};
