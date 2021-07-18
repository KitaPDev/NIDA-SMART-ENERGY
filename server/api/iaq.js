const got = require("got");
const dotenv = require("dotenv");
const FormData = require("form-data");
const knex = require("../database").knex;
const dateFormatter = require("../utils/dateFormatter");

const baseUrl = process.env.NIDA_API_BASE_URL;

let accessToken = "";

let updateDataDelay = 3000;

async function start() {
	// setTimeout(updateDataIaq, updateDataDelay);
}

function setAccessToken(token) {
	accessToken = token;
}

module.exports = {
	start,
	setAccessToken,
};
