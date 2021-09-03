const knex = require("../database").knex;
const dateFormatter = require("../utils/dateFormatter");
const userService = require("../services/user.service");

async function getActivityByPeriod(from, to) {
	let result = await knex("activity")
		.join("user", "activity.user_id", "=", "user.id")
		.join("action", "activity.action_id", "=", "action.id")
		.join("user_type", "user.user_type_id", "=", "user_type.id")
		.select(
			"activity.datetime",
			"user_type.label as user_type",
			"user.username",
			"action.label as action"
		)
		.whereBetween("activity.datetime", [
			dateFormatter.yyyymmddhhmmss(from),
			dateFormatter.yyyymmddhhmmss(to),
		]);

	return result;
}

async function insertActivity(username, actionID) {
	let userID = await userService.getUserIDbyUsername(username);

	await knex("activity").insert({
		datetime: dateFormatter.yyyymmddhhmmss(new Date()),
		user_id: userID,
		action_id: actionID,
	});
}

module.exports = {
	getActivityByPeriod,
	insertActivity,
};
