const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const request = require("request");
const httpStatusCodes = require("http-status-codes").StatusCodes;

const userRouter = require("./routers/user.router");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: false,
	})
);
app.use(cookieParser());

app.get("/", async function (req, res) {
	res.status(httpStatusCodes.OK);
	res.send("Server Operating Normally");
});

app.use("/user", userRouter);

module.exports = app;
