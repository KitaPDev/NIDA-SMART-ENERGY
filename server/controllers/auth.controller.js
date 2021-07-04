const userService = require("../services/user.service");
const authService = require("../services/auth.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function login(req, res) {
	try {
		let body = req.body;
		let username = body.username;
		let clearTextPassword = body.password;

		if (!username) {
			return res.status(httpStatusCodes.FORBIDDEN).send("Username is required");
		}

		if (!(await userService.usernameExists(username))) {
			return res
				.status(httpStatusCodes.NOT_FOUND)
				.send("Username does not exist.");
		}

		if (await userService.isDeactivated(username)) {
			return res
				.status(httpStatusCodes.FORBIDDEN)
				.send(
					"Your user has been deactivated. For help, contact an administrator."
				);
		}

		if (username !== "admin") {
			if (
				!(await userService.isEmailVerified(
					await userService.getEmailFromUsername(username)
				))
			) {
				return res
					.status(httpStatusCodes.UNAUTHORIZED)
					.send("Email is not verified");
			}
		}

		if (!(await authService.verifyPassword(username, clearTextPassword))) {
			return res.status(httpStatusCodes.UNAUTHORIZED).send("Wrong password.");
		}

		userService.stampLogin(username);

		let jwt = await authService.generateJwt(username);

		let refreshJwt = await authService.generateRefreshJwt(username);

		res.cookie("jwt", jwt);
		res.cookie("refresh_jwt", refreshJwt);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}

	res.sendStatus(httpStatusCodes.OK);
}

async function logout(req, res) {
	try {
		res.clearCookie("jwt");
		res.clearCookie("refresh_jwt");
		res.sendStatus(httpStatusCodes.OK);
		return;
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function getUsername(req, res) {
	try {
		let username = await authService.getUsernameFromCookies(req);

		if (username) {
			return res.status(httpStatusCodes.OK).send(username);
		}

		return res.sendStatus(httpStatusCodes.FORBIDDEN);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = { login, logout, getUsername };
