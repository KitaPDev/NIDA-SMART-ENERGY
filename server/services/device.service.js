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
			"device.meter_id",
			"building.label as building",
			"device.floor",
			"device.location",
			"device.site",
			"electrical_system.label as system",
			"device.is_active",
			"device.activated_timestamp"
		);

	return result;
}

module.exports = {
	getAllDevice,
};
