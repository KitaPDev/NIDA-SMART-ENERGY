const knex = require("../database").knex;

async function getAllDevice(from, to) {
	let result = await knex("device")
		.join("building", "device.building_id", "=", "building.id")
		.join(
			"electrical_system",
			"device.electrical_system_id",
			"=",
			"electrical_system.id"
		)
		.select(
			"device.id",
			"building.label as building",
			"device.brand_model",
			"device.floor",
			"device.location",
			"device.site",
			"electrical_system.label as system",
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
	electricalSystem,
	isActive,
	activatedDate
) {
	let result = await knex("building").select("id").where("label", building);
	let buildingID = result[0].id;

	result = await knex("electrical_system")
		.select("id")
		.where("label", electricalSystem);
	let electricalSystemID = result[0].id;

	await knex("device").insert({
		id: deviceID,
		building_id: buildingID,
		electrical_system_id: electricalSystemID,
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
	electricalSystem,
	activatedDate
) {
	let result = await knex("building").select("id").where("label", building);
	let buildingID = result[0].id;

	result = await knex("electrical_system")
		.select("id")
		.where("label", electricalSystem);
	let electricalSystemID = result[0].id;

	await knex("device")
		.where({ id: deviceID })
		.update({
			id: deviceID,
			building_id: buildingID,
			electrical_system_id: electricalSystemID,
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

module.exports = {
	getAllDevice,
	insertDevice,
	updateDevice,
};
