const knex = require("../database").knex;

async function getAllDevice(from, to) {
	let result = await knex("device")
		.join("building", "device.building_id", "=", "building.id")
		.join("system", "device.system_id", "=", "system.id")
		.select(
			"device.id",
			"building.label as building",
			"device.brand_model",
			"device.floor",
			"device.location",
			"device.site",
			"system.label as system",
			"device.is_active",
			"device.activated_timestamp"
		);

	return result;
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

module.exports = {
	getAllDevice,
	insertDevice,
	updateDevice,
	getAllDeviceID,
	getAllPowerMeterDeviceID,
	getAllIaqDeviceID,
};
