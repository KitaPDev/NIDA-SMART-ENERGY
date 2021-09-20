const httpStatusCodes = require("http-status-codes").StatusCodes;
const jwt = require("jsonwebtoken");
const activityService = require("../services/activity.service");
const userService = require("../services/user.service");

module.exports = async (req, res, next, actionID) => {
	let cookies = req.cookies;
	const token = cookies.jwt;
	try {
		if (req.originalUrl.includes("reset-password")) {
			let hash = req.params.hash;
			let userID = await userService.getUserIDByEmailHash(hash);
			activityService.insertActivityUserID(userID, actionID);
		} else {
			let decodedToken = jwt.decode(token, process.env.TOKEN_SECRET);
			activityService.insertActivityUsernameUserID(
				decodedToken.username,
				actionID
			);
		}

		return next();
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
};
