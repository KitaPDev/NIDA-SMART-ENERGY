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

async function checkUserTypePermission(userType, permission) {
	let result = await knex("user_type_permission as utp")
		.count("* as count")
		.where(
			knex.raw(
				`utp.user_type_id = 
					(SELECT id FROM user_type 
							WHERE label = '${userType}')
			AND utp.permission_id = 
				(SELECT id FROM permission 
						WHERE label = '${permission.replace("'", "''")}')`
			)
		);

	if (result[0].count === 1) return true;

	return false;
}

async function getPermissionsByUsername(username) {
	let result = await knex("user_type_permission as utp")
		.join("permission", "utp.permission_id", "=", "permission.id")
		.select("permission.id", "permission.label")
		.where(
			knex.raw(
				`utp.user_type_id = 
				(SELECT user_type_id FROM user
					WHERE user.username = '${username}')`
			)
		);

	return result;
}

async function getGeneralUserPermissions() {
	let result = await knex("user_type_permission as utp")
		.join("permission", "utp.permission_id", "=", "permission.id")
		.select("permission.id", "permission.label")
		.where("utp.user_type_id", "=", 7);

	return result;
}

module.exports = {
	getAllUserTypePermission,
	getAllPermission,
	updateUserTypePermission,
	checkUserTypePermission,
	getPermissionsByUsername,
	getGeneralUserPermissions,
};
