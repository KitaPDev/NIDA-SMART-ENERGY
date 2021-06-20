module.exports = class User {
	id;
	user_type_id;
	username;
	email;
	salt;
	hash_password;
	is_email_verified;
	activated_timestamp;
	last_login_timestamp;
	is_enabled;

	constructor(
		id,
		user_type_id,
		username,
		email,
		salt,
		hash_password,
		is_email_verified,
		activated_timestamp,
		last_login_timestamp,
		is_enabled
	) {
		this.id = id;
		this.user_type_id = user_type_id;
		this.username = username;
		this.email = email;
		this.salt = salt;
		this.hash_password = hash_password;
		this.is_email_verified = is_email_verified;
		this.activated_timestamp = activated_timestamp;
		this.last_login_timestamp = last_login_timestamp;
		this.is_enabled = is_enabled;
	}
};
