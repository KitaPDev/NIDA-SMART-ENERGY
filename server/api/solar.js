const dotenv = require("dotenv");
const axios = require("axios");
const dateFormatter = require("../utils/dateFormatter");
const apiService = require("../services/api.service");

const baseUrl = process.env.NIDA_API_BASE_URL;
const axiosInstance = axios.create({
	baseURL: baseUrl + "/api/pmsolarcell",
});

let accessToken = "";

const dateZero = new Date(2021, 6, 15);

let updateDataDelay = 3000;

async function start() {
	setTimeout(updateDataSolar, updateDataDelay);
}

function setAccessToken(token) {
	accessToken = token;
}

async function updateDataSolar() {
	if (accessToken.length === 0) {
		setTimeout(updateDataSolar, updateDataDelay);
		return;
	}

	try {
		let dataSolar = await apiService.getLatestLogSolar();

		let dateStart = new Date(dateZero);

		if (dataSolar !== undefined && dataSolar !== null) {
			if (dataSolar.data_datetime !== undefined) {
				dateStart = new Date(dataSolar.data_datetime);
			}
		}

		if (dateStart.getTime() > dateZero.getTime()) {
			dateStart.setSeconds(dateStart.getSeconds() + 1);
		}

		let dateEnd = new Date(
			new Date(new Date(dateStart).setDate(dateStart.getDate() + 7))
		);

		const postData = {
			startdatetime: dateFormatter.yyyymmddhhmmss(dateStart),
			enddatetime: dateFormatter.yyyymmddhhmmss(dateEnd),
		};

		const headers = {
			"Content-Type": "application/json",
			Authorization: "Bearer " + accessToken,
		};

		let resp = await axiosInstance.post("/datetime", postData, {
			headers: headers,
		});

		let data = resp.data.data;

		let lsLogSolar = [];
		for (let [key, value] of Object.entries(data)) {
			let logSolar = {};

			logSolar["data_datetime"] = value["DataDateTime"];
			logSolar["device_id"] = value["Device"];
			logSolar["current_l1"] = value["Current_L1"];
			logSolar["current_l2"] = value["Current_L2"];
			logSolar["current_l3"] = value["Current_L3"];
			logSolar["demand"] = value["Demand"];
			logSolar["hz"] = value["Hz"];
			logSolar["kva"] = value["kVA"];
			logSolar["kvar"] = value["kVar"];
			logSolar["kw"] = value["kW"];
			logSolar["kw_l1"] = value["kW_L1"];
			logSolar["kw_l2"] = value["kW_L2"];
			logSolar["kw_l3"] = value["kW_L3"];
			logSolar["kwh"] = value["kWh"];
			logSolar["pf"] = value["PF"];
			logSolar["pf_l1"] = value["PF_L1"];
			logSolar["pf_l2"] = value["PF_L2"];
			logSolar["pf_l3"] = value["PF_L3"];
			logSolar["voltage_l1"] = value["Voltage_L1"];
			logSolar["voltage_l2"] = value["Voltage_L2"];
			logSolar["voltage_l3"] = value["Voltage_L3"];

			lsLogSolar.push(logSolar);
		}

		if (lsLogSolar.length > 0) {
			await apiService.insertLogSolar(lsLogSolar);
		} else {
			updateDataDelay = 900000;
		}
	} catch (err) {
		console.log(err);
		updateDataDelay = 5000;
	}
	setTimeout(updateDataSolar, updateDataDelay);
}

module.exports = {
	start,
	setAccessToken,
};
