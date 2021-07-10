const knex = require("../database").knex;

async function getAllPermission() {
	let result = await knex("permission").select();

	return result;
}

async function getAllUserTypePermission() {
	let result = await knex("user_type_permission").select();

	return result;
}

async function updateUserTypePermission(userTypeID, permissionID) {
	let result = await knex(knex.ref("user_type_permission"))
		.where({
			user_type_id: userTypeID,
			permission_id: permissionID,
		})
		.count("* as count");

	let isExists = result[0].count !== 0;

	if (!isExists) {
		await knex("user_type_permission").insert({
			user_type_id: userTypeID,
			permission_id: permissionID,
		});
	} else {
		await knex("user_type_permission")
			.where({
				user_type_id: userTypeID,
				permission_id: permissionID,
			})
			.delete();
	}
}

module.exports = {
	getAllUserTypePermission,
	getAllPermission,
	updateUserTypePermission,
};
