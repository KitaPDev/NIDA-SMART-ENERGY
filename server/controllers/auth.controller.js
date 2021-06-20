const userService = require("../services/user.service");
const authService = require("../services/auth.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function login(req, res) {
	try {
		let body = req.body;
		let username = body.username;
		let clearTextPassword = body.password;

		if (!userService.usernameExists(username)) {
			res.status(httpStatusCodes.NOT_FOUND).send("Username does not exist.");
			return;
		}

		if (!authService.verifyPassword(username, clearTextPassword)) {
			res.status(httpStatusCodes.UNAUTHORIZED).send("Wrong password.");
			return;
		}

		userService.login(username);

		let jwt = authService.generateJwt(username);

		let refreshJwt = authService.generateRefreshJwt(username);

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

async function newToken(req, res) {
	try {
		let body = req.body;

		let refreshToken = body.refresh_jwt;

		let newToken = authService.newToken(refreshToken);

		if (newToken === undefined) {
			res.clearCookie("jwt");
			res.clearCookie("refresh_jwt");
			res.status(httpStatusCodes.UNAUTHORIZED).send();
			return;
		}

		res.cookie("jwt", newToken);
		res.status(httpStatusCodes.OK).send();
		return;
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = { login, logout, newToken };
