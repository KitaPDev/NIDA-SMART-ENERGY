import axios from "axios";

const FormData = require("form-data");

let accessToken = "";
let dateZero = new Date(2021, 5, 22);

const username = process.env.REACT_APP_NIDA_API_USERNAME;
const password = process.env.REACT_APP_NIDA_API_PASSWORD;

let intervalGetToken;
let intervalUpdateData;

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
	intervalUpdateData = setInterval(updateDataPower, 3000);
}

async function updateDataPower() {
	if (accessToken.length === 0) {
		return;
	}

	try {
	} catch (err) {
		console.log(err);
	}
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

		let resp = await axiosInstance.post("/api/powermeter/device/lastupdate", {
			headers: { Authorization: "Bearer " + accessToken },
			data: form,
		});

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

		let resp = await axiosInstance.post("/api/powermeter/device/lastupdate", {
			headers: { Authorization: "Bearer " + accessToken },
			data: form,
		});

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
