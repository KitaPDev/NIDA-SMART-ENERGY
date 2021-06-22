const httpStatusCodes = require("http-status-codes").StatusCodes;
const authService = require("../services/auth.service");
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
	let cookies = req.cookies;
	const token = cookies.jwt;
	if (token) {
		try {
			let decodedToken = jwt.decode(token, process.env.TOKEN_SECRET);

			let refreshToken = cookies.refresh_jwt;

			let newToken = await authService.newToken(refreshToken);

			if (newToken === undefined) {
				res.clearCookie("jwt");
				res.clearCookie("refresh_jwt");
				return res.status(httpStatusCodes.UNAUTHORIZED).send();
			}

			res.cookie("jwt", newToken);

			req.userType = decodedToken.userType;
		} catch (err) {
			console.log(err);
			return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
		}

		next();
	} else {
		return res.status(httpStatusCodes.UNAUTHORIZED).send("No token provided.");
	}
};
