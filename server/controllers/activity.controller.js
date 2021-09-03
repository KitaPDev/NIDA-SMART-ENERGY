const activityService = require("../services/activity.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function getActivityPeriod(req, res) {
	try {
		let body = req.body;
		let from = new Date(body.from);
		let to = new Date(body.to);

		let result = await activityService.getActivityByPeriod(from, to);

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = { getActivityPeriod };
