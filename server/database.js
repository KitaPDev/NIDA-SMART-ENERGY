const Knex = require("knex");
const dotenv = require("dotenv");

dotenv.config();

const dbConfig = {
	client: process.env.DB_CLIENT,
	connection: {
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
		port: process.env.DB_PORT,
	},
	searchPath: ["knex", "public"],
};

let knex = Knex(dbConfig);

async function isDBConnected() {
	let result = await knex.raw("select 1+1 as result");
	return Boolean(result);
}

module.exports = {
	knex,
	isDBConnected,
};
