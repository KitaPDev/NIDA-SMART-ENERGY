const http = require("http");
// const https = require("https");
// const fs = require("fs");
const app = require("../app");
const dotenv = require("dotenv");
const db = require("../database");
const apiService = require("../api/api");

dotenv.config();

if (process.env.NODE_ENV === "production") console.log = () => {};

hostname = process.env.HOSTNAME;
port = process.env.PORT;
app.set("host", hostname);
app.set("port", port);

// let privateKey = fs.readFileSync("sslcert/server.key", "utf8");
// let certificate = fs.readFileSync("sslcert/server.crt", "utf8");

const server = http.createServer(app);

// const sslServer = https.createServer(
// 	{ key: privateKey, cert: certificate },
// 	app
// );
server.listen(app.get("port"), async function () {
	try {
		let isDBConnected = await db.isDBConnected();

		if (isDBConnected) {
			console.log("DATABASE CONNECTION SUCCESSFUL");
		} else {
			console.log("DATABASE CONNECTION FAILED");
		}

		apiService.start();

		console.log("Server listening on port " + port + ".");
	} catch (err) {
		console.log(err);
	}
});
