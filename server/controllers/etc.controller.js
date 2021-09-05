const etcService = require("../services/etc.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;
const mailer = require("../mailer");

async function getVisitors(req, res) {
	try {
		let result = await etcService.getVisitors();

		return res.status(httpStatusCodes.OK).send(result);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

async function share(req, res) {
	try {
		let email = req.body.email;

		mailer.sendShareEmail(email);

		return res.sendStatus(httpStatusCodes.OK);
	} catch (err) {
		return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
	}
}

module.exports = {
	getVisitors,
	share,
};
