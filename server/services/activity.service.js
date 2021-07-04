const knex = require("../database").knex;

async function getActivityByPeriod(from, to) {
	let result = await knex("user_action")
		.join("user", "user_action.user_id", "=", "user.id")
		.join("action", "user_action.action_id", "=", "action.id")
		.join("user_type", "user.user_type_id", "=", "user_type.id")
		.select(
			"user_action.logged_timestamp",
			"user_type.label as user_type",
			"user.username",
			"action.label as action"
		)
		.where("user_action.logged_timestamp", ">", from)
		.andWhere("user_action.logged_timestamp", "<", to);

	return result;
}

module.exports = {
	getActivityByPeriod,
};
