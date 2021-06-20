const knex = require("../database").knex;
const authService = require("../services/auth.service");
const crypto = require("crypto");

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
	let salt = await authService.generateSalt();
	let hash = await authService.hashPassword(clearTextPassword, salt);

	await knex(knex.ref("user")).insert({
		user_type_id: userTypeID,
		username: username,
		email: email,
		salt: salt,
		hash_password: hash,
		is_email_verified: false,
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

async function login(username) {
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
	let hash = await authService.hashPassword(clearTextPassword, salt);

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
	login,
	updatePassword,
	emailHashExists,
	getEmailHashByUserID,
	getSaltByUserID,
	getAllUserType,
};
