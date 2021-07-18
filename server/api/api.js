const axios = require("axios");
const got = require("got");
const dotenv = require("dotenv");
const FormData = require("form-data");
const knex = require("../database").knex;
const dateFormatter = require("../utils/dateFormatter");

const powermeterService = require("./powermeter");
const iaqService = require("./iaq");

const baseUrl = process.env.NIDA_API_BASE_URL;
const username = process.env.NIDA_API_USERNAME;
const password = process.env.NIDA_API_PASSWORD;

const axiosInstance = axios.create({
	baseURL: baseUrl,
});

let accessToken = "";

let intervalGetToken;

async function start() {
	intervalGetToken = setInterval(updateToken, 5000);
	powermeterService.start();
}

async function updateToken() {
	try {
		let postData = {
			username: username,
			password: password,
		};

		let resp = await axiosInstance.post("/api/token", postData);

		accessToken = resp.data.access_token;

		powermeterService.setAccessToken(accessToken);
		iaqService.setAccessToken(accessToken);
	} catch (err) {
		console.log("Error: Update Token; " + err.code);
	}
}

module.exports = {
	start,
	updateToken,
};
