const deviceService = require("../services/device.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function getAllDevice(_, res) {
	try {
		let result = await deviceService.getAllDevice();

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function newDevice(req, res) {
	try {
		let body = req.body;
		let deviceID = body.id;
		let building = body.building;
		let floor = body.floor;
		let location = body.location;
		let site = body.site;
		let brandModel = body.brand_model;
		let system = body.system;
		let activatedDate = new Date(body.activated_datetime);

		if (floor === "") floor = null;

		await deviceService.insertDevice(
			deviceID,
			building,
			floor,
			location,
			site,
			brandModel,
			system,
			activatedDate
		);

		return res.sendStatus(httpStatusCodes.OK);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function editDevice(req, res) {
	try {
		let body = req.body;
		let deviceID = body.id;
		let building = body.building;
		let floor = body.floor;
		let location = body.location;
		let site = body.site;
		let brandModel = body.brand_model;
		let system = body.system;
		let activatedDate = new Date(body.activated_datetime);

		if (floor === "") floor = null;

		await deviceService.updateDevice(
			deviceID,
			building,
			floor,
			location,
			site,
			brandModel,
			system,
			activatedDate
		);

		return res.sendStatus(httpStatusCodes.OK);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function deleteDevice(req, res) {
	try {
		let body = req.body;
		let deviceID = body.id;

		await deviceService.deleteDevice(deviceID);

		return res.sendStatus(httpStatusCodes.OK);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getAllDeviceLatestLog(req, res) {
	try {
		let result = await deviceService.getAllDeviceLatestLog();

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getExportData(req, res) {
	try {
		let body = req.body;
		let dateFrom = body.date_from;
		let dateTo = body.date_to;
		let interval = body.interval;
		let deviceID = body.device_id;

		let result = await deviceService.getDeviceExportData(
			deviceID,
			dateFrom,
			dateTo,
			interval
		);

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = {
	getAllDevice,
	newDevice,
	editDevice,
	deleteDevice,
	getAllDeviceLatestLog,
	getExportData,
};
