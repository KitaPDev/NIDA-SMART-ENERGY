const User = require("../models/user.model");
const knex = require("../database").knex;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

async function generateSalt() {
	return await bcrypt.genSalt(10);
}

async function hashPassword(clearTextPassword, salt) {
	return await bcrypt.hash(clearTextPassword, salt);
}

async function verifyPassword(username, clearTextPassword) {
	let result = await knex(knex.ref("user"))
		.select("hash_password", "salt")
		.where("username", username);
	let recvHash = result[0].hash_password;
	let salt = result[0].salt;

	let hash = hashPassword(clearTextPassword, salt);

	return hash === recvHash;
}

async function generateJwt(username) {
	return jwt.sign({ username: username }, process.env.TOKEN_SECRET, {
		expiresIn: process.env.TOKEN_LIFE,
	});
}

async function generateRefreshJwt(username) {
	return jwt.sign({ username: username }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: process.env.REFRESH_TOKEN_LIFE,
	});
}

async function newToken(refreshToken) {
	let verifiedToken = jwt.verify(refreshToken, process.env.TOKEN_SECRET);
	let exp = verifiedToken.exp;

	if (Date.now() >= exp) {
		return { undefined, undefined };
	}

	let username = verifiedToken.username;
	let token = generateJwt(username);

	return token;
}

module.exports = {
	generateSalt,
	hashPassword,
	verifyPassword,
	generateJwt,
	generateRefreshJwt,
	newToken,
};
