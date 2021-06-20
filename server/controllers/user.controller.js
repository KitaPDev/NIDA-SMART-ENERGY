const userService = require("../services/user.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;
const mailer = require("../mailer");

const emailRegex =
	/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

async function register(req, res) {
	try {
		let body = req.body;

		let username = body.username;
		let email = body.email;
		let clearTextPassword = body.password;
		let userTypeID = body.user_type_id;

		if (await userService.usernameExists(username)) {
			res.status(httpStatusCodes.FORBIDDEN).send("Username already exists.");
			return;
		}

		if (!emailRegex.test(email)) {
			res.status(httpStatusCodes.FORBIDDEN).send("Email is not valid.");
			return;
		}

		if (await userService.emailExists(email)) {
			res.status(httpStatusCodes.FORBIDDEN).send("Email already exists.");
			return;
		}

		if (clearTextPassword.length < 8) {
			res.status(httpStatusCodes.FORBIDDEN).send("Password is too short.");
			return;
		}

		if (
			userTypeID === undefined ||
			userTypeID <= 0 ||
			!userService.userTypeExists(userTypeID)
		) {
			res.status(httpStatusCodes.FORBIDDEN).send("User type is not valid.");
			return;
		}

		let err = await userService.insertUser(
			username,
			email,
			clearTextPassword,
			userTypeID
		);
		if (err != undefined) {
			throw new Error(err);
		}

		let userID = await userService.getUserIDbyUsername(username);

		let hash = await userService.insertEmailHash(userID);

		mailer.sendConfirmationEmail(email, hash, username);

		res.sendStatus(httpStatusCodes.OK);
	} catch (err) {
		console.log(err);
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function confirmEmail(req, res) {
	try {
		let hash = req.params.hash;

		let userID = await userService.getUserIDByEmailHash(hash);

		if (!userID) {
			return res
				.status(httpStatusCodes.FORBIDDEN)
				.send("Email hash is not valid.");
		}

		userService.deleteEmailHash(userID);
		userService.updateUserEmailVerified(userID);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}

	res
		.status(httpStatusCodes.OK)
		.sendFile(process.cwd() + "/views/success_confirmEmail.html");
}

async function forgotPassword(req, res) {
	try {
		let body = req.body;

		let username = body.username;
		let email = body.email;

		if (username.length === 0 && email.length === 0) {
			return res
				.status(httpStatusCodes.FORBIDDEN)
				.send("Provide either username or email");
		}

		if (username.length > 0 && email.length === 0) {
			email = await userService.getEmailFromUsername(username);
		}

		if (!(await userService.emailExists(email))) {
			return res.status(httpStatusCodes.FORBIDDEN).send("Email does not exist");
		}

		if (!(await userService.isEmailVerified(email))) {
			return res
				.status(httpStatusCodes.FORBIDDEN)
				.send("Email has not been verified");
		}

		let userID = await userService.getUserIDByEmail(email);
		let hash = "";

		if (await userService.emailHashExists(userID)) {
			hash = await userService.getEmailHashByUserID(userID);
		} else {
			hash = await userService.insertEmailHash(userID);
		}

		mailer.sendForgotPasswordEmail(email, hash);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}

	res.sendStatus(httpStatusCodes.OK);
}

async function getResetPasswordForm(req, res) {
	try {
		let hash = req.params.hash;

		let userID = await userService.getUserIDByEmailHash(hash);

		if (!userID) {
			return res
				.status(httpStatusCodes.FORBIDDEN)
				.send("Email hash is not valid.");
		}

		res
			.status(httpStatusCodes.OK)
			.sendFile(process.cwd() + "/views/resetPassword.html");
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function changePassword(req, res) {
	try {
		let body = req.body;
		let hash = req.params.hash;

		let userID = await userService.getUserIDByEmailHash(hash);

		if (!userID) {
			return res
				.status(httpStatusCodes.FORBIDDEN)
				.send("Email hash is not valid.");
		}

		userService.deleteEmailHash(userID);

		userService.updatePassword(userID, body.password);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}

	res
		.status(httpStatusCodes.OK)
		.sendFile(process.cwd() + "/views/success_resetPassword.html");
}

async function getAllUserType(req, res) {
	try {
		let result = await userService.getAllUserType();

		let lsUserType = [];

		for (let r of result) {
			let userType = {};

			userType.id = r.id;
			userType.label = r.label;

			lsUserType.push(userType);
		}

		res.status(httpStatusCodes.OK).send(lsUserType);
		return;
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = {
	register,
	confirmEmail,
	forgotPassword,
	getResetPasswordForm,
	changePassword,
	getAllUserType,
};
