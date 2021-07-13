const got = require("got");
const dotenv = require("dotenv");
const FormData = require("form-data");

let accessToken = "";

const baseUrl = process.env.NIDA_API_BASE_URL;
const username = process.env.NIDA_API_USERNAME;
const password = process.env.NIDA_API_PASSWORD;

async function getToken() {
	try {
		let { body } = await got.post(baseUrl + "/api/token", {
			json: {
				username: username,
				password: password,
			},
			responseType: "json",
		});

		accessToken = body.access_token;
	} catch (err) {
		console.log(err);
	}
}

async function getAllLatestData() {
	try {
		let { body } = await got(baseUrl + "/api/powermeter/lastupdate", {
			headers: { Authorization: "Bearer " + accessToken },
		});

		let data = body.data;
	} catch (err) {
		console.log(err);
	}
}

async function getDataByDeviceID(deviceID) {
	try {
		let form = new FormData();
		form.append("deviceid", deviceID);

		let { body } = await got(baseUrl + "/api/powermeter/device/lastupdate", {
			headers: { Authorization: "Bearer " + accessToken },
			body: form,
		});

		let data = body.data;
	} catch (err) {
		console.log(err);
	}
}

module.exports = {
	getToken,
	getAllLatestData,
	getDataByDeviceID,
};
