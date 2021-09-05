const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const emails = require("./emails");

let transporter = nodemailer.createTransport({
	name: process.env.MAIL_HOST,
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	secureConnection: process.env.MAIL_SECURE,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS,
	},
	tls: {
		ciphers: process.env.MAIL_CIPHERS,
	},
});

async function sendConfirmationEmail(email, hash, username) {
	transporter.sendMail(
		emails.makeConfirmationEmail(email, hash, username),
		(err, info) => {
			if (err) {
				console.log("ERROR: ", err.message);
				return;
			}
			transporter.close();
		}
	);
}

async function sendForgotPasswordEmail(email, hash) {
	transporter.sendMail(
		emails.makeForgotPasswordEmail(email, hash),
		(err, info) => {
			if (err) {
				console.log("ERROR: ", err.message);
				return;
			}
			transporter.close();
		}
	);
}

async function sendShareEmail(email) {
	transporter.sendMail(emails.makeShareEmail(email), (err, info) => {
		if (err) {
			console.log("ERROR: ", err.message);
			return;
		}
		transporter.close();
	});
}

module.exports = {
	sendConfirmationEmail,
	sendForgotPasswordEmail,
	sendShareEmail,
};
