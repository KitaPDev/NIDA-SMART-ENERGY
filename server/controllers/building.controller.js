const buildingService = require("../services/building.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function getAll(req, res) {
	try {
		let lsBuilding = await buildingService.getAllBuilding();
		lsBuilding.sort((a, b) =>
			a.label > b.label ? 1 : b.label > a.label ? -1 : 0
		);
		return res.status(httpStatusCodes.OK).send(lsBuilding);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getBuildingPowerByDatetime(req, res) {
	try {
		let body = req.body;
		let start = body.start;
		let end = body.end;

		let lsPowerData = await buildingService.getBuildingPowerByDatetime(
			start,
			end
		);

		return res.status(httpStatusCodes.OK).send(lsPowerData);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = {
	getAll,
	getBuildingPowerByDatetime,
};
