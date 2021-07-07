const electricalSystemService = require("../services/electricalSystem.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function getAllElectricalSystem(req, res) {
	try {
		let result = await electricalSystemService.getAllElectricalSystem();

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = { getAllElectricalSystem };
