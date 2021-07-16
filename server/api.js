const got = require("got");
const dotenv = require("dotenv");
const FormData = require("form-data");
const knex = require("./database").knex;
const dateFormatter = require("./utils/dateFormatter");

const baseUrl = process.env.NIDA_API_BASE_URL;
const username = process.env.NIDA_API_USERNAME;
const password = process.env.NIDA_API_PASSWORD;

let accessToken = "";
let dateZero = new Date(
	new Date(2021, 5, 22).getTime() + new Date().getTimezoneOffset() * 60000
);
let updateDataDelay = 3000;

let intervalGetToken;

async function start() {
	intervalGetToken = setInterval(getToken, 5000);
	setTimeout(updateDataPower, updateDataDelay);
}

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
async function updateDataPower() {
	if (accessToken.length === 0) {
		setTimeout(updateDataPower, updateDataDelay);
		return;
	}

	updateDataDelay = 900000;

	try {
		let dataPower = await getAllLogPowerMeter();
		let dateStart = dateFormatter.yyyymmddhhmmss(dateZero);
		let dateEnd = dateFormatter.yyyymmddhhmmss(new Date());

		if (dataPower !== undefined && dataPower !== null) {
			if (dataPower.length > 0) {
				dataPower.sort(
					(a, b) =>
						new Date(a.DataDateTime).getTime() -
						new Date(b.DataDateTime).getTime()
				);

				dateStart = dateFormatter.yyyymmddhhmmss(
					new Date(dataPower[0].DataDateTime)
				);
			}
		}

		let data = {
			startdatetime: dateStart,
			enddatetime: dateEnd,
		};

		let { body } = await got.post(baseUrl + "/api/powermeter/datetime", data, {
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + accessToken,
			},
		});

		console.log(body);

		setTimeout(updateDataPower, updateDataDelay);
	} catch (err) {
		console.log(err);
		updateDataDelay = 3000;
	}

	setTimeout(updateDataPower, updateDataDelay);
}

async function getAllLogPowerMeter() {
	let result = await knex("log_power_meter").orderBy("data_datetime");

	return result;
}

module.exports = {
	start,
	getToken,
	getAllLatestData,
	getDataByDeviceID,
	updateDataPower,
};
