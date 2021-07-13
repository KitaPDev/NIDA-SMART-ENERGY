const http = require("http");
const app = require("../app");
const dotenv = require("dotenv");
const db = require("../database");

const api = require("../api");

dotenv.config();

port = process.env.PORT;
app.set("port", port);

const server = http.createServer(app);
server.listen(port, async function () {
	let isDBConnected = await db.isDBConnected();

	if (isDBConnected) {
		console.log("DATABASE CONNECTION SUCCESSFUL");
	} else {
		console.log("DATABASE CONNECTION FAILED");
	}

	api.getToken();
	console.log("Server listening on port " + port + ".");
});
