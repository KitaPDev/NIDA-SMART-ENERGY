import React from "react";

class EditProfile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: "",
			email: "",
			userType: "",
			activatedDate: "",
			lastLogin: "",
		};
	}
	render() {
		return <div>Edit Profile</div>;
	}
}

export default EditProfile;
