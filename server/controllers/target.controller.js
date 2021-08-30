const targetService = require("../services/target.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function inputTarget(req, res) {
	try {
		let body = req.body;
		let month = body.month;
		let year = body.year;
		let buildingID = body.building_id;
		let electricityBill = body.electricity_bill;
		let amountPeople = body.amount_people;
		let tariff = body.tariff;
		let energyUsage = body.energy_usage;

		if (!month && !year && !buildingID) {
			return res
				.status(httpStatusCodes.FORBIDDEN)
				.send("Please provide month and year.");
		}

		if (await targetService.targetExists(buildingID, month, year)) {
			await targetService.updateTarget(
				buildingID,
				month,
				year,
				electricityBill,
				amountPeople,
				tariff,
				energyUsage
			);
		} else {
			await targetService.insertTarget(
				buildingID,
				month,
				year,
				electricityBill,
				amountPeople,
				tariff,
				energyUsage
			);
		}

		return res.sendStatus(httpStatusCodes.OK);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getAllTargetByMonthYear(req, res) {
	try {
		let body = req.body;
		let month = body.month;
		let year = body.year;

		let lsTarget = await targetService.getAllTargetByMonthYear(month, year);

		return res.status(httpStatusCodes.OK).send(lsTarget);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getAllBuildingTariffByMonthYear(req, res) {
	try {
		let body = req.body;
		let month = body.month;
		let year = body.year;

		let lsTarget = await targetService.getAllTargetByMonthYear(month, year);

		let tariff_building = {};
		for (let target of lsTarget) {
			tariff_building[target.building] = target.tariff;
		}

		return res.status(httpStatusCodes.OK).send(tariff_building);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getBuildingTargetRange(req, res) {
	try {
		let body = req.body;
		let yearFrom = body.year_from;
		let monthFrom = body.month_from;
		let yearTo = body.year_to;
		let monthTo = body.month_to;
		let buildingID = body.building_id;

		let result = await targetService.getBuildingTargetRange(
			buildingID,
			yearFrom,
			monthFrom,
			yearTo,
			monthTo
		);

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getTargetPresets(req, res) {
	try {
		let body = req.body;
		let month = body.month;
		let year = body.year;
		let buildingID = body.building_id;

		let data = await targetService.getTargetPresetData(buildingID, month, year);

		let presets = {
			lastMonthTarget_bill: 0,
			lastMonthActual_bill: 0,
			lastYearTarget_bill: 0,
			lastYearActual_bill: 0,
			monthAverage_bill: 0,
			yearAverage_bill: 0,
			lastMonthTarget_usage: 0,
			lastMonthActual_usage: 0,
			lastYearTarget_usage: 0,
			lastYearActual_usage: 0,
			monthAverage_usage: 0,
			yearAverage_usage: 0,
		};

		let lsTarget = data.lsTarget;
		let lsLog = data.lsLog;

		let targetLastMonth = lsTarget.find(
			(target) => target.month === month - 1 && target.year === year
		);
		if (targetLastMonth !== undefined) {
			presets.lastMonthTarget_bill = targetLastMonth.electricity_bill;
			presets.lastMonthTarget_usage = targetLastMonth.energy_usage;
		}

		let targetLastYear = lsTarget.find(
			(target) => target.month === month && target.year === year - 1
		);
		if (targetLastMonth !== undefined) {
			presets.lastYearTarget_bill = targetLastYear.electricity_bill;
			presets.lastYearTarget_usage = targetLastYear.energy_usage;
		}

		let lsPrevDevice = [];
		lsLog
			.slice()
			.reverse()
			.forEach((log) => {
				if (lsPrevDevice.includes(log.device)) return;
				let datetime = log.data_datetime;
				let mth = datetime.getMonth();
				let yr = datetime.getFullYear();

				let yearCompare = year;
				let monthCompare = month - 1;
				if (month === 0) {
					monthCompare += 12;
					yearCompare--;
				}

				if (mth === monthCompare && yr === yearCompare) {
					if (log.kwh !== null) {
						presets.lastMonthActual_usage += log.kwh;
						lsPrevDevice.push(log.device);
					}
				}
			});
		lsPrevDevice = [];
		lsLog.forEach((log) => {
			if (lsPrevDevice.includes(log.device)) return;
			let datetime = log.data_datetime;
			let mth = datetime.getMonth();
			let yr = datetime.getFullYear();

			let yearCompare = year;
			let monthCompare = month - 1;
			if (month === 0) {
				monthCompare += 12;
				yearCompare--;
			}

			if (mth === monthCompare && yr === yearCompare) {
				if (log.kwh !== null) {
					presets.lastMonthActual_usage -= log.kwh;
					lsPrevDevice.push(log.device);
				}
			}
		});

		let tariff = 4;
		if (targetLastMonth !== undefined) {
			if (targetLastMonth.tariff !== null) tariff = targetLastMonth.tariff;
		}
		presets.lastMonthActual_bill = presets.lastMonthActual_usage * tariff;

		lsPrevDevice = [];
		lsLog
			.slice()
			.reverse()
			.forEach((log) => {
				if (lsPrevDevice.includes(log.device)) return;
				let datetime = log.data_datetime;
				let mth = datetime.getMonth();
				let yr = datetime.getFullYear();

				if (mth === month && yr === year - 1) {
					if (log.kwh !== null) {
						presets.lastYearActual_usage += log.kwh;
						lsPrevDevice.push(log.device);
					}
				}
			});
		lsPrevDevice = [];
		lsLog.forEach((log) => {
			if (lsPrevDevice.includes(log.device)) return;
			let datetime = log.data_datetime;
			let mth = datetime.getMonth();
			let yr = datetime.getFullYear();

			if (mth === month && yr === year - 1) {
				if (log.kwh !== null) {
					presets.lastYearActual_usage -= log.kwh;
					lsPrevDevice.push(log.device);
				}
			}
		});

		tariff = 4;
		if (targetLastYear !== undefined) {
			if (targetLastYear.tariff !== null) tariff = targetLastYear.tariff;
		}
		presets.lastYearActual_bill = presets.lastYearActual_usage * tariff;

		for (let i = 1; i <= 3; i++) {
			lsPrevDevice = [];
			lsLog
				.slice()
				.reverse()
				.forEach((log) => {
					if (lsPrevDevice.includes(log.device)) return;
					let datetime = log.data_datetime;
					let mth = datetime.getMonth();
					let yr = datetime.getFullYear();

					if (mth === month && yr === year - i) {
						if (log.kwh !== null) {
							presets.monthAverage_usage += log.kwh;

							let tariff = 4;
							let target = lsTarget.find(
								(target) => target.month === month && target.year === year - i
							);
							if (target !== undefined) {
								if (target.tariff !== null) tariff = target.tariff;
							}
							presets.monthAverage_bill += log.kwh * tariff;

							lsPrevDevice.push(log.device);
						}
					}
				});
			lsPrevDevice = [];
			lsLog.forEach((log) => {
				if (lsPrevDevice.includes(log.device)) return;
				let datetime = log.data_datetime;
				let mth = datetime.getMonth();
				let yr = datetime.getFullYear();

				if (mth === month && yr === year - i) {
					if (log.kwh !== null) {
						presets.monthAverage_usage -= log.kwh;

						let tariff = 4;
						let target = lsTarget.find(
							(target) => target.month === month && target.year === year - i
						);
						if (target !== undefined) {
							if (target.tariff !== null) tariff = target.tariff;
						}
						presets.monthAverage_bill -= log.kwh * tariff;

						lsPrevDevice.push(log.device);
					}
				}
			});
		}

		presets.monthAverage_usage /= 3;
		presets.monthAverage_bill /= 3;

		for (let i = 1; i <= 12; i++) {
			lsPrevDevice = [];
			lsLog
				.slice()
				.reverse()
				.forEach((log) => {
					if (lsPrevDevice.includes(log.device)) return;
					let datetime = log.data_datetime;
					let mth = datetime.getMonth();
					let yr = datetime.getFullYear();

					let monthCompare = month - i;
					let yearCompare = year;
					if (monthCompare < 0) {
						monthCompare += 12;
						yearCompare--;
					}

					if (mth === monthCompare && yr === yearCompare) {
						if (log.kwh !== null) {
							presets.yearAverage_usage += log.kwh;

							let tariff = 4;
							let target = lsTarget.find(
								(target) =>
									target.month === monthCompare && target.year === yearCompare
							);
							if (target !== undefined) {
								if (target.tariff !== null) tariff = target.tariff;
							}
							presets.yearAverage_bill += log.kwh * tariff;

							lsPrevDevice.push(log.device);
						}
					}
				});
			lsPrevDevice = [];
			lsLog.forEach((log) => {
				if (lsPrevDevice.includes(log.device)) return;
				let datetime = log.data_datetime;
				let mth = datetime.getMonth();
				let yr = datetime.getFullYear();

				let monthCompare = month - i;
				let yearCompare = year;
				if (monthCompare < 0) {
					monthCompare += 12;
					yearCompare--;
				}

				if (mth === monthCompare && yr === yearCompare) {
					if (log.kwh !== null) {
						presets.yearAverage_usage -= log.kwh;

						let tariff = 4;
						let target = lsTarget.find(
							(target) =>
								target.month === monthCompare && target.year === yearCompare
						);
						if (target !== undefined) {
							if (target.tariff !== null) tariff = target.tariff;
						}
						presets.yearAverage_bill -= log.kwh * tariff;

						lsPrevDevice.push(log.device);
					}
				}
			});
		}

		presets.yearAverage_usage /= 12;
		presets.yearAverage_bill /= 12;

		for (let [key, value] of Object.entries(presets)) {
			presets[key] = +parseFloat(value).toFixed(2);
		}

		return res.status(httpStatusCodes.OK).send(presets);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = {
	inputTarget,
	getAllTargetByMonthYear,
	getAllBuildingTariffByMonthYear,
	getBuildingTargetRange,
	getTargetPresets,
};
