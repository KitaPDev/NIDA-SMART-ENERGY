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
		let token = req.cookie.jwt;
		let username = authService.getUsernameFromToken(token);

		if (username) {
			return res.status(httpStatusCodes.OK).send(username);
		}

		return res.sendStatus(httpStatusCodes.FORBIDDEN);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = { login, logout, getUsername };
