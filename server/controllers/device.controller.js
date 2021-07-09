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
		let meterID = body.meter_id;
		let building = body.building;
		let floor = body.floor;
		let location = body.location;
		let site = body.site;
		let brandModel = body.brand_model;
		let electricalSystem = body.system;
		let isActive = body.is_active;
		let activatedDate = new Date(body.activated_date);

		await deviceService.insertDevice(
			meterID,
			building,
			floor,
			location,
			site,
			brandModel,
			electricalSystem,
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
		let meterID = body.meter_id;
		let building = body.building;
		let floor = body.floor;
		let location = body.location;
		let site = body.site;
		let brandModel = body.brand_model;
		let electricalSystem = body.system;
		let activatedDate = new Date(body.activated_date);

		await deviceService.updateDevice(
			meterID,
			building,
			floor,
			location,
			site,
			brandModel,
			electricalSystem,
			activatedDate
		);

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = { getAllDevice, newDevice, editDevice };
