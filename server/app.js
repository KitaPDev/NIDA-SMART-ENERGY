const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const httpStatusCodes = require("http-status-codes").StatusCodes;

const authRouter = require("./routers/auth.router");
const userRouter = require("./routers/user.router");
const targetRouter = require("./routers/target.router");
const buildingRouter = require("./routers/building.router");
const activityRouter = require("./routers/activity.router");
const deviceRouter = require("./routers/device.router");
const systemRouter = require("./routers/system.router");
const permissionRouter = require("./routers/permission.router");
const apiRouter = require("./routers/api.router");
const etcRouter = require("./routers/etc.router");

const app = express();

// const corsOptions = { credentials: true, origin: true };

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

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/target", targetRouter);
app.use("/building", buildingRouter);
app.use("/activity", activityRouter);
app.use("/device", deviceRouter);
app.use("/system", systemRouter);
app.use("/permission", permissionRouter);
app.use("/api", apiRouter);
app.use("/etc", etcRouter);

module.exports = app;
