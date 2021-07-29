const deviceService = require("../services/device.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function getAllDevice(req, res) {
	try {
		let result = await deviceService.getAllDevice();

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
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
		let isActive = body.is_active;
		let activatedDate = new Date(body.activated_date);

		await deviceService.insertDevice(
			deviceID,
			building,
			floor,
			location,
			site,
			brandModel,
			system,
			isActive,
			activatedDate
		);

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
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
		let activatedDate = new Date(body.activated_date);

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

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
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
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = {
	getAllDevice,
	newDevice,
	editDevice,
	deleteDevice,
};
