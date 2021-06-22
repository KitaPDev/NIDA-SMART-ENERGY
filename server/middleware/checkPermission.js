const httpStatusCodes = require("http-status-codes").StatusCodes;
const authService = require("../services/auth.service");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
	try {
		let userType = req.userType;

		//get user type;

		// if (userType) {
		// 	if (decodedToken.userType !== userType) {
		// 		return res.status(httpStatusCodes.UNAUTHORIZED).send();
		// 	}
		// }

		res.cookie("jwt", newToken);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}

	next();
};
