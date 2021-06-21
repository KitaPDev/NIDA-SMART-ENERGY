const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const authService = require("../services/auth.service");

module.exports = (req, res, next) => {
	const token = req.cookies.jwt;
	if (token) {
		jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
			if (err) {
				return res
					.status(401)
					.json({ error: true, message: "Unauthorized access." });
			}

			try {
				let cookies = req.cookies;

				let refreshToken = cookies.refresh_jwt;

				let newToken = authService.newToken(refreshToken);

				if (newToken === undefined) {
					res.clearCookie("jwt");
					res.clearCookie("refresh_jwt");
					res.status(httpStatusCodes.UNAUTHORIZED).send();
				}

				res.cookie("jwt", newToken);
				res.status(httpStatusCodes.OK).send();
			} catch (err) {
				return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
			}

			next();
		});
	} else {
		return res.status(401).send({
			error: true,
			message: "No token provided.",
		});
	}
};
