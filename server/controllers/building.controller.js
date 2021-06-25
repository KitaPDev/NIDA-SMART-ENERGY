const buildingService = require("../services/building.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function getAll(req, res) {
	try {
		let lsBuilding = await buildingService.getAllBuildings();
		return res.status(httpStatusCodes.OK).send(lsBuilding);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = { getAll };
