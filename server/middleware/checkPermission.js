const httpStatusCodes = require("http-status-codes").StatusCodes;
const jwt = require("jsonwebtoken");
const permissionService = require("../services/permission.service");
const userService = require("../services/user.service");

module.exports = async (req, res, next, permission) => {
	let cookies = req.cookies;
	const token = cookies.jwt;
	try {
		let decodedToken = jwt.decode(token, process.env.TOKEN_SECRET);

		let userType = decodedToken.type;
		if (userType === "Super Admin") return next();

		if (permission === "Add/Edit/Delete Other User") {
			if (
				(req.body.username === decodedToken.username ||
					req.body.prev_username === decodedToken.username) &&
				req.url !== "/activate"
			)
				return next();
		}

		if (!(await userService.isUserTypeApproved(decodedToken.username))) {
			userType = "General User";
		}

		if (
			(await permissionService.checkUserTypePermission(
				userType,
				permission
			)) === true
		) {
			return next();
		}

		return res.sendStatus(httpStatusCodes.FORBIDDEN);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
};
