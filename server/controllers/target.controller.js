const targetService = require("../services/target.service");
const buildingService = require("../services/building.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function getBuildingPeople(req, res) {
	try {
		let body = req.body;
		let month = body.month;
		let year = body.year;

		if (!month || !year) {
			return res
				.status(httpStatusCodes.FORBIDDEN)
				.send("Please provide month and year.");
		}

		let lsBuildingIDAmountPeople = await targetService.getBuildingPeople(
			month,
			year
		);

		let lsBuilding = await buildingService.getAllBuildings();

		let lsBuildingLabelAmountPeople = [];
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = { getBuildingPeople };
