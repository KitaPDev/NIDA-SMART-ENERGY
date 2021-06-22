const bcrypt = require("bcrypt");

async function generateSalt() {
	return await bcrypt.genSalt(10);
}

async function hashPassword(clearTextPassword, salt) {
	return await bcrypt.hash(clearTextPassword, salt);
}

module.exports = {
	generateSalt,
	hashPassword,
};
