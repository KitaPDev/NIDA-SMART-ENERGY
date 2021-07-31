const axios = require("axios");
const dateFormatter = require("../utils/dateFormatter");
const apiService = require("../services/api.service");
const deviceService = require("../services/device.service");

const baseUrl = process.env.NIDA_API_BASE_URL;
const axiosInstance = axios.create({
	baseURL: baseUrl + "/api/iaq",
});

const DEVICE_ID = process.env.NIDA_API_IAQ_DEVICE_ID;

let accessToken = "";

const dateZero = new Date(2021, 6, 15);

let updateDataDelay = 3000;

async function start() {
	setTimeout(updateDataIaq, updateDataDelay);
}

function setAccessToken(token) {
	accessToken = token;
}

async function updateDataIaq() {
	if (accessToken.length === 0) {
		setTimeout(updateDataIaq, updateDataDelay);
		return;
	}

	try {
		let dataIaq = await apiService.getLatestLogIaq();

		let dateStart = new Date(dateZero);

		if (dataIaq !== undefined && dataIaq !== null) {
			if (dataIaq.data_datetime !== undefined) {
				dateStart = new Date(dataIaq.data_datetime);
			}
		}

		if (dateStart.getTime() > dateZero.getTime()) {
			dateStart.setSeconds(dateStart.getSeconds() + 1);
		}

		let dateEnd = new Date(
			new Date(new Date(dateStart).setDate(dateStart.getDate() + 3))
		);

		const postData = {
			startdatetime: dateFormatter.yyyymmddhhmmss(dateStart),
			enddatetime: dateFormatter.yyyymmddhhmmss(dateEnd),
			deviceid: DEVICE_ID,
		};

		const headers = {
			"Content-Type": "application/json",
			Authorization: "Bearer " + accessToken,
		};

		let resp = await axiosInstance.post("/device/datetime", postData, {
			headers: headers,
		});

		let data = resp.data.data;

		let lsDeviceID = await deviceService.getAllIaqDeviceID();

		let lsLogIaq = [];
		for (let [, value] of Object.entries(data)) {
			if (!lsDeviceID.includes(value["Device"])) continue;

			let logIaq = {};

			logIaq["data_datetime"] = value["DataDateTime"];
			logIaq["device_id"] = value["Device"];
			logIaq["co2"] = value["CO2"];
			logIaq["humidity"] = value["Humidity"];
			logIaq["pm2_5"] = value["PM2_5"];
			logIaq["temperature"] = value["Temperature"];

			lsLogIaq.push(logIaq);
		}

		if (lsLogIaq.length > 0) {
			await apiService.insertLogIaq(lsLogIaq);
		} else {
			updateDataDelay = 600000;
		}
	} catch (err) {
		console.log(err);
		updateDataDelay = 5000;
	}
	setTimeout(updateDataIaq, updateDataDelay);
}

module.exports = {
	start,
	setAccessToken,
};
