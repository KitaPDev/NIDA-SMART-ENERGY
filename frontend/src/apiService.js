import http from "./utils/http";
import { BehaviorSubject } from "rxjs";

const subjectPowerMeterData = new BehaviorSubject();
const subjectIaqData = new BehaviorSubject();
const subjectSolarData = new BehaviorSubject();

const apiService = {
	updatePowerMeterData: async function (dateStart, dateEnd) {
		try {
			let today = new Date();

			if (!dateStart || !dateEnd) {
				dateStart = new Date(
					today.getFullYear(),
					today.getMonth(),
					today.getDate(),
					0,
					0,
					0
				);
				dateEnd = today;
			}

			let payload = {
				start: dateStart,
				end: dateEnd,
			};

			let resp = await http.post("/api/power/datetime", payload);

			let dataPower = resp.data;

			subjectPowerMeterData.next(dataPower);
		} catch (err) {
			console.log(err);
			return err.response;
		}
	},

	updateIaqData: async function (dateStart, dateEnd) {
		try {
			let today = new Date();

			if (!dateStart || !dateEnd) {
				dateStart = new Date().setDate(today.getDate() - 1);
				dateEnd = today;
			}

			let payload = {
				start: dateStart,
				end: dateEnd,
			};

			let resp = await http.post("/api/iaq/datetime", payload);

			let dataIaq = resp.data;

			subjectIaqData.next(dataIaq);
		} catch (err) {
			console.log(err);
			return err.response;
		}
	},

	updateSolarData: async function (dateStart, dateEnd) {
		try {
			let today = new Date();

			if (!dateStart || !dateEnd) {
				dateStart = new Date().setDate(today.getDate() - 1);
				dateEnd = today;
			}

			let payload = {
				start: dateStart,
				end: dateEnd,
			};

			let resp = await http.post("/api/solar/datetime", payload);

			let dataSolar = resp.data;

			subjectSolarData.next(dataSolar);
		} catch (err) {
			console.log(err);
			return err.response;
		}
	},
};

export { subjectPowerMeterData, subjectIaqData, subjectSolarData, apiService };
