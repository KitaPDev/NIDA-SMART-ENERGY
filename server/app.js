const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const request = require("request");
const httpStatusCodes = require("http-status-codes").StatusCodes;
const dotenv = require("dotenv");
// const db = require("./database");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(cookieParser());

app.get("/", async function (req, res) {
	res.status(httpStatusCodes.OK);
	res.send("Server Operating Normally");
});

dotenv.config();

port = process.env.PORT;
app.listen(port, async () => {
	// let isDBConnected = await db.isDBConnected();

	// if (isDBConnected) {
	// 	console.log("DATABASE CONNECTION SUCCESS");
	// } else {
	// 	console.log("DATABASE CONNECTION FAILED");
	// 	process.exit(1);
	// }

	console.log(`Server listening at ` + port);
});
