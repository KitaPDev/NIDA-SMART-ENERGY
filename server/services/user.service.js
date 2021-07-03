const knex = require("../database").knex;
const crypto = require("crypto");
const cryptoUtil = require("../utils/crypto.util");
const b64toBlob = require("../utils/b64blob.util").b64toBlob;

async function generateEmailHash() {
	return crypto.randomBytes(20).toString("hex");
}

async function usernameExists(username) {
	let result = await knex(knex.ref("user"))
		.where("username", username)
		.count("* as count");
	return result[0].count !== 0;
}

async function emailExists(email) {
	let result = await knex(knex.ref("user"))
		.where("email", email)
		.count("* as count");
	return result[0].count !== 0;
}

async function userTypeExists(id) {
	let result = await knex(knex.ref("user_type"))
		.where("id", id)
		.count("* as count");
	return result[0].count !== 0;
}

async function insertUser(username, email, clearTextPassword, userTypeID) {
	let salt = await cryptoUtil.generateSalt();
	let hash = await cryptoUtil.hashPassword(clearTextPassword, salt);

	let isUserTypeApproved = 0;
	if (userTypeID === 4) {
		isUserTypeApproved = 1;
	}

	await knex(knex.ref("user")).insert({
		user_type_id: userTypeID,
		username: username,
		email: email,
		salt: salt,
		hash_password: hash,
		is_email_verified: false,
		is_user_type_approved: isUserTypeApproved,
	});
}

async function getUserIDbyUsername(username) {
	let result = await knex(knex.ref("user"))
		.select("id")
		.where("username", username);

	return result[0].id;
}

async function insertEmailHash(userID) {
	let hash = await generateEmailHash();

	await knex(knex.ref("hash_email")).insert({
		user_id: userID,
		hash: hash,
	});

	return hash;
}

async function getUserIDByEmailHash(hash) {
	let result = await knex(knex.ref("hash_email"))
		.select("user_id")
		.where("hash", hash);

	return result ? result[0].user_id : undefined;
}

async function deleteEmailHash(userID) {
	await knex(knex.ref("hash_email")).where("user_id", userID).del();
}

async function updateUserEmailVerified(userID) {
	await knex(knex.ref("user"))
		.where("id", userID)
		.update({
			is_email_verified: 1,
			activated_timestamp: new Date(new Date().toISOString())
				.toJSON()
				.slice(0, 19)
				.replace("T", " "),
		});
}

async function getEmailFromUsername(username) {
	let result = await knex(knex.ref("user"))
		.select("email")
		.where("username", username);

	return result ? result[0].email : undefined;
}

async function isEmailVerified(email) {
	let result = await knex(knex.ref("user"))
		.select("is_email_verified")
		.where("email", email);

	return result ? result[0].is_email_verified : undefined;
}

async function getUserIDByEmail(email) {
	let result = await knex(knex.ref("user")).select("id").where("email", email);

	return result ? result[0].id : undefined;
}

async function stampLogin(username) {
	await knex(knex.ref("user"))
		.where("username", username)
		.update({
			last_login_timestamp: new Date(new Date().toISOString())
				.toJSON()
				.slice(0, 19)
				.replace("T", " "),
		});
}

async function updatePassword(userID, clearTextPassword) {
	let salt = await getSaltByUserID(userID);
	let hash = await cryptoUtil.hashPassword(clearTextPassword, salt);

	await knex(knex.ref("user"))
		.where("id", userID)
		.update({ hash_password: hash });
}

async function emailHashExists(userID) {
	let result = await knex(knex.ref("hash_email"))
		.where("user_id", userID)
		.count("* as count");

	return result[0].count !== 0;
}

async function getEmailHashByUserID(userID) {
	let result = await knex(knex.ref("hash_email"))
		.select("hash")
		.where("user_id", userID);

	return result[0].hash;
}

async function getSaltByUserID(userID) {
	let result = await knex(knex.ref("user")).select("salt").where("id", userID);
	return result[0].salt;
}

async function getAllUserType() {
	let result = await knex(knex.ref("user_type")).select();
	return result;
}

async function getUserTypeByUsername(username) {
	let userID = await getUserIDbyUsername(username);
	let lsUserType = await getAllUserType();

	for (let userType of lsUserType) {
		if (userType.user_id === userID) {
			return userType.label;
		}
	}
}

async function getUserInfoByUsername(username) {
	let result = await knex(knex.ref("user"))
		.select(
			"user_type_id",
			"username",
			"email",
			"activated_timestamp",
			"last_login_timestamp",
			"profile_image",
			"profile_image_content_type",
			"is_user_type_approved",
			"is_deactivated"
		)
		.where("username", username);
	result[0].user_type = await getUserTypeLabel(result[0].user_type_id);

	return result[0];
}

async function getUserTypeLabel(userTypeID) {
	let result = await knex(knex.ref("user_type"))
		.select("label")
		.where("id", userTypeID);

	return result[0].label;
}

async function updateUsername(prevUsername, username) {
	await knex(knex.ref("user"))
		.where("username", prevUsername)
		.update({ username: username });
}

async function updateEmail(username, email) {
	await knex(knex.ref("user"))
		.where("username", username)
		.update({ email: email, is_email_verified: 0 });
}

async function updateProfileImage(username, b64Image) {
	let contentType = b64Image.substring(
		b64Image.lastIndexOf(":") + 1,
		b64Image.lastIndexOf(";")
	);

	let b64data = atob(b64Image.split(",")[1]);

	const blob = b64toBlob(b64data, contentType);
	let buffer = blob.buffer;

	await knex(knex.ref("user"))
		.where("username", username)
		.update({ profile_image: buffer, profile_image_content_type: contentType });
}

async function isDeactivated(username) {
	let result = await knex(knex.ref("user"))
		.select("is_deactivated")
		.where("username", username);

	return result ? result[0].is_deactivated : undefined;
}

async function deactivateUser(username) {
	await knex(knex.ref("user"))
		.where("username", username)
		.update({ is_deactivated: 1 });
}

async function activateUser(username) {
	await knex(knex.ref("user"))
		.where("username", username)
		.update({ is_deactivated: 0 });
}

async function getAllUser() {
	let result = await knex("user")
		.join("user_type", "user.user_type_id", "=", "user_type.id")
		.select(
			"user.username",
			"user.email",
			"user_type.label as user_type",
			"user.activated_timestamp",
			"user.last_login_timestamp",
			"user.is_user_type_approved"
		);

	return result;
}

module.exports = {
	usernameExists,
	emailExists,
	userTypeExists,
	insertUser,
	getUserIDbyUsername,
	insertEmailHash,
	getUserIDByEmailHash,
	deleteEmailHash,
	updateUserEmailVerified,
	getEmailFromUsername,
	isEmailVerified,
	getUserIDByEmail,
	stampLogin,
	updatePassword,
	emailHashExists,
	getEmailHashByUserID,
	getSaltByUserID,
	getAllUserType,
	getUserTypeByUsername,
	getUserInfoByUsername,
	getUserTypeLabel,
	updateUsername,
	updateEmail,
	updateProfileImage,
	isDeactivated,
	deactivateUser,
	activateUser,
	getAllUser,
};
