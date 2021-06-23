import React from "react";
import FormData from "form-data";
import { ImagePicker } from "react-file-picker";
import { Row, Col, Container, Table } from "reactstrap";
import "./EditProfile.css";
import { FaCamera, FaUserCircle } from "react-icons/fa";
import httpService from "../../../httpService";

class EditProfile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: "",
			email: "",
			userType: "",
			activatedDate: "",
			lastLogin: "",
			profielImage: "",
		};

		this.getUserInfo = this.getUserInfo.bind(this);
	}

	componentDidMount() {
		this.getUserInfo();
	}

	componentDidUpdate() {
		console.log(this.state);
	}

	async getUserInfo() {
		let resp = await httpService.get("/user/info");
		let userInfo = resp.data;

		let username = userinfo.username;
		let email = userinfo.email;
		let activatedDate = new Date(userinfo.activated_timestamp);
		let lastLoginDate = new Date(userinfo.last_login_timestamp);
		let profileImage = userInfo.profile_image;
		let isUserTypeApproved = userInfo.is_user_type_approved;
		let isActivated = userInfo.is_activated;

		this.setState({
			username: username,
			email: email,
			activatedDate: activatedDate,
			lastLoginDate: lastLoginDate,
			profileImage: profileImage,
			isUserTypeApproved: isUserTypeApproved,
			isActivated: isActivated,
		});
	}

	render() {
		let { profielImage } = this.state;

		return (
			<div>
				<Container fluid>
					<Row className="heading">User Information</Row>
					<Row>
						<Col sm={2}>
							<Row className="row-user-image">
								{profileImage.length === 0 ? (
									<FaUserCircle size={200} style={{ opacity: 0.9 }} />
								) : (
									<img
										className="user-image"
										src={profileImage}
										alt="Profile picture"
									/>
								)}
							</Row>
							<Row className="row-imagepicker">
								<ImagePicker
									extensions={["jpg", "png", "jpeg", "JPG", "PNG", "JPEG"]}
									dims={{
										minWidth: 100,
										maxWidth: 500,
										minHeight: 100,
										maxHeight: 500,
									}}
									onChange={(base64) => this.setState({ profileImage: base64 })}
									onError={(err) => {
										alert(err);
									}}
								>
									<span className="choose-image">
										<FaCamera />
										Choose an Image
									</span>
								</ImagePicker>
							</Row>
						</Col>
						<Col sm={4}>
							<Table>
								<tbody>
									<tr>
										<th scope="row">Username</th>
										<td>{}</td>
									</tr>
								</tbody>
							</Table>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default EditProfile;
