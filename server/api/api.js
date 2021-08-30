const axios = require("axios");
const dotenv = require("dotenv");

const powermeterService = require("./powermeter");
const iaqService = require("./iaq");
const solarService = require("./solar");

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
	iaqService.start();
	solarService.start();
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
		solarService.setAccessToken(accessToken);
	} catch (err) {
		console.log("Error: Update Token; " + err.code);
	}
}

module.exports = {
	start,
	updateToken,
};
