import axios from "axios";
import dateFormatter from "../utils/dateFormatter";

const FormData = require("form-data");

let accessToken = "";
let dateZero = new Date(
	new Date(2021, 5, 22).getTime() + new Date().getTimezoneOffset() * 60000
);
let updateDataDelay = 3000;

const username = process.env.REACT_APP_NIDA_API_USERNAME;
const password = process.env.REACT_APP_NIDA_API_PASSWORD;

let intervalGetToken;

const axiosInstance = axios.create({
	baseURL: process.env.REACT_APP_NIDA_API_BASE_URL,
});

axiosInstance.interceptors.response.use(
	(resp) => {
		return resp;
	},
	(err) => {
		let resp = err.response;

		if (resp.status === 401 && resp.data.message === "Unauthenticated.") {
			intervalGetToken = setInterval(getToken, 5000);
		}

		return Promise.reject(err);
	}
);

async function start() {
	intervalGetToken = setInterval(getToken, 5000);
	setTimeout(updateDataPower, updateDataDelay);
}

async function updateDataPower() {
	if (accessToken.length === 0) {
		setTimeout(updateDataPower, updateDataDelay);
		return;
	}

	updateDataDelay = 900000;

	try {
		let dataPower = localStorage.getItem("data_power");
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

		let form = new FormData();
		form.append("startdatetime", dateStart);
		form.append("enddatetime", dateEnd);

		let data = {
			startdatetime: dateStart,
			enddatetime: dateEnd,
		};

		let resp = await axios.post(
			"http://api2energy.nida.ac.th/api/powermeter/datetime",
			data,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + accessToken,
				},
			}
		);

		setTimeout(updateDataPower, updateDataDelay);
	} catch (err) {
		console.log(err);
		updateDataDelay = 3000;
	}

	setTimeout(updateDataPower, updateDataDelay);
}

async function getToken() {
	try {
		let payload = {
			username: username,
			password: password,
		};

		let resp = await axiosInstance.post("/api/token", payload);

		if (resp.status === 200) {
			accessToken = resp.data.access_token;
			localStorage.setItem("api_token", accessToken);
			clearInterval(intervalGetToken);
		}
	} catch (err) {
		console.log(err);
	}
}

async function getAllLatestDataPower() {
	try {
		let resp = await axiosInstance.get("/api/powermeter/lastupdate", {
			headers: { Authorization: "Bearer " + accessToken },
		});

		return resp.data.data;
	} catch (err) {
		console.log(err);
	}
}

async function getDataPowerByDeviceID(deviceID) {
	try {
		let form = new FormData();
		form.append("deviceid", deviceID);

		let resp = await axiosInstance.post(
			"/api/powermeter/device/lastupdate",
			form,
			{
				headers: { Authorization: "Bearer " + accessToken },
			}
		);

		return resp.data.data;
	} catch (err) {
		console.log(err);
	}
}

async function getAllDataPowerByDatetime(datetimeBegin, datetimeEnd) {
	try {
		let form = new FormData();
		form.append("startdatetime", datetimeBegin);
		form.append("enddatetime", datetimeEnd);

		let resp = await axiosInstance.post(
			"/api/powermeter/device/lastupdate",
			form,
			{
				headers: { Authorization: "Bearer " + accessToken },
			}
		);

		return resp.data.data;
	} catch (err) {
		console.log(err);
	}
}

export {
	start,
	getToken,
	getAllLatestDataPower,
	getDataPowerByDeviceID,
	getAllDataPowerByDatetime,
};
