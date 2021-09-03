const httpStatusCodes = require("http-status-codes").StatusCodes;
const jwt = require("jsonwebtoken");
const activityService = require("../services/activity.service");

module.exports = async (req, res, next, actionID) => {
	let cookies = req.cookies;
	const token = cookies.jwt;
	try {
		let decodedToken = jwt.decode(token, process.env.TOKEN_SECRET);
		activityService.insertActivity(decodedToken.username, actionID);

		return next();
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
};
