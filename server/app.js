const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const request = require("request");
const httpStatusCodes = require("http-status-codes").StatusCodes;

const authRouter = require("./routers/auth.router");
const userRouter = require("./routers/user.router");

const app = express();

const corsOptions = { credentials: true, origin: true };

app.use(cors(corsOptions));
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

app.use("/auth", authRouter);
app.use("/user", userRouter);

module.exports = app;
