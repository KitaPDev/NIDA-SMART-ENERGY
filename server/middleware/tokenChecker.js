const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

module.exports = (req, res, next) => {
	const token =
		req.body.token || req.query.token || req.headers["x-access-token"];
	if (token) {
		jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
			if (err) {
				return res
					.status(401)
					.json({ error: true, message: "Unauthorized access." });
			}
			req.decoded = decoded;
			next();
		});
	} else {
		return res.status(403).send({
			error: true,
			message: "No token provided.",
		});
	}
};
