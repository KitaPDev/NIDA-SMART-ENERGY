const knex = require("../database").knex;
const dateFormatter = require("../utils/dateFormatter");

async function getAllDevice() {
	let data = [];

	let result = await knex("device")
		.leftJoin("building", "device.building_id", "=", "building.id")
		.leftJoin("system", "device.system_id", "=", "system.id")
		.select(
			"device.id",
			"building.label as building",
			"device.brand_model",
			"device.floor",
			"device.location",
			"device.site",
			"system.label as system",
			"device.activated_timestamp"
		);

	data = result.slice();

	result = await knex("log_power_meter")
		.join(
			"log_iaq",
			"log_iaq.data_datetime",
			"=",
			"log_power_meter.data_datetime"
		)
		.join(
			"log_solar",
			"log_solar.data_datetime",
			"=",
			"log_power_meter.data_datetime"
		)
		.distinct(
			"log_power_meter.device_id as meter_id",
			"log_iaq.device_id as iaq_id",
			"log_solar.device_id as solar_id"
		)
		.where(
			"log_power_meter.data_datetime",
			"<",
			dateFormatter.yyyymmddhhmmss(new Date(new Date().getTime() - 900000))
		);

	data.forEach(function (d) {
		d.is_active = false;

		for (let row of result) {
			if (Object.values(row).includes(d.id)) {
				d.is_active = true;
				break;
			}
		}
	});

	return data;
}

async function insertDevice(
	deviceID,
	building,
	floor,
	location,
	site,
	brandModel,
	system,
	isActive,
	activatedDate
) {
	let result = await knex("building").select("id").where("label", building);
	let buildingID = result[0].id;

	result = await knex("system").select("id").where("label", system);
	let systemID = result[0].id;

	await knex("device").insert({
		id: deviceID,
		building_id: buildingID,
		system_id: systemID,
		brand_model: brandModel,
		location: location,
		site: site,
		activated_timestamp: activatedDate
			.toISOString()
			.slice(0, 19)
			.replace("T", " "),
		is_active: isActive,
		floor: floor,
	});
}

async function updateDevice(
	deviceID,
	building,
	floor,
	location,
	site,
	brandModel,
	system,
	activatedDate
) {
	let result = await knex("building").select("id").where("label", building);
	let buildingID = result[0].id;

	result = await knex("system").select("id").where("label", system);
	let systemID = result[0].id;

	await knex("device")
		.where({ id: deviceID })
		.update({
			id: deviceID,
			building_id: buildingID,
			system_id: systemID,
			brand_model: brandModel,
			location: location,
			site: site,
			activated_timestamp: activatedDate
				.toISOString()
				.slice(0, 19)
				.replace("T", " "),
			floor: floor,
		});
}

async function getAllDeviceID() {
	let result = await knex("device").select("id");

	let lsDeviceID = [];
	for (let row of result) {
		lsDeviceID.push(row.id);
	}

	return lsDeviceID;
}

async function getAllPowerMeterDeviceID() {
	let result = await knex("device")
		.select("id")
		.where(function () {
			this.where("system_id", 1).orWhere("system_id", 2);
		});

	let lsDeviceID = [];
	for (let row of result) {
		lsDeviceID.push(row.id);
	}

	return lsDeviceID;
}

async function getAllIaqDeviceID() {
	let result = await knex("device").select("id").where("system_id", 4);

	let lsDeviceID = [];
	for (let row of result) {
		lsDeviceID.push(row.id);
	}

	return lsDeviceID;
}

async function deleteDevice(deviceID) {
	await knex("device").where("id", deviceID).delete();
}

async function getAllDeviceLatestLog() {
	let now = new Date();
	let result = await knex.raw(
		`SELECT lpm.*, device.brand_model, device.location, device.site, 
		device.activated_timestamp, device.floor, building.label as building, 
		system.label as system 
		FROM log_power_meter lpm
		INNER JOIN device ON device.id = lpm.device_id
		INNER JOIN system ON system.id = device.system_id
		INNER JOIN building ON building.id = device.building_id
		WHERE lpm.data_datetime >= '${dateFormatter.yyyymmddhhmmss(
			new Date(now.getTime() - 1800000)
		)}'
		ORDER BY lpm.data_datetime DESC;`
	);

	let data = [];
	let lsPrevDevice = [];
	for (let row of result[0]) {
		if (lsPrevDevice.includes(row.device_id)) continue;

		data.push(row);
		lsPrevDevice.push(row.device_id);
	}

	return data;
}

async function getDeviceExportData(deviceID, dateFrom, dateTo, interval) {
	interval = interval.split(" ");
	let amount = interval[0];
	let unit = interval[1];

	unit === "min"
		? (unit = "MINUTE")
		: unit === "hour"
		? (unit = "HOUR")
		: unit === "day"
		? (unit = "DAY")
		: "MINUTE";

	let result = await knex.raw(
		`SELECT * FROM log_power_meter
		WHERE device_id = '${deviceID}'
		AND ${unit}(data_datetime) % ${amount} = 0
		${unit !== "MINUTE" ? `AND MINUTE(data_datetime) = 0` : ""}
		${unit === "DAY" ? `AND HOUR(data_datetime) = 0` : ""}
		AND data_datetime 
			BETWEEN '${dateFormatter.yyyymmddhhmmss(new Date(dateFrom))}' 
			AND '${dateFormatter.yyyymmddhhmmss(new Date(dateTo))}';`
	);

	return result[0];
}

module.exports = {
	getAllDevice,
	insertDevice,
	updateDevice,
	getAllDeviceID,
	getAllPowerMeterDeviceID,
	getAllIaqDeviceID,
	deleteDevice,
	getAllDeviceLatestLog,
	getDeviceExportData,
};
