import React from "react";

import "./EditProfile.css";
import { ImagePicker } from "react-file-picker";
import {
	Row,
	Col,
	Container,
	Table,
	Button,
	Input,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "reactstrap";
import { FaCamera, FaUserCircle } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";

import http from "../../../utils/http";
import validator from "validator";

import { withTranslation } from "react-i18next";

class EditProfile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentUsername: localStorage.getItem("current_username"),
			currentUserType: "",
			prevUsername: "",
			prevEmail: "",
			username: "",
			email: "",
			userType: "",
			dateActivated: "",
			dateLastLogin: "",
			prevProfileImage: "",
			profileImage: "",
			isUserTypeApproved: 0,
			isDeactivated: 0,
			isEditUsernameMode: false,
			isEditEmailMode: false,
			isModalConfirmUsernameOpen: false,
			isModalConfirmEmailOpen: false,
			isModalConfirmChangePasswordOpen: false,
			isModalConfirmDeactivateOpen: false,
			isModalConfirmActivateOpen: false,
			isModalConfirmApproveOpen: false,
		};

		this.getUserInfo = this.getUserInfo.bind(this);
		this.formatDate = this.formatDate.bind(this);
		this.toggleEditUsername = this.toggleEditUsername.bind(this);
		this.toggleEditEmail = this.toggleEditEmail.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.submitUsername = this.submitUsername.bind(this);
		this.submitEmail = this.submitEmail.bind(this);
		this.toggleModalConfirmUsername =
			this.toggleModalConfirmUsername.bind(this);
		this.toggleModalConfirmEmail = this.toggleModalConfirmEmail.bind(this);
		this.toggleModalConfirmChangePassword =
			this.toggleModalConfirmChangePassword.bind(this);
		this.toggleModalConfirmDeactivate =
			this.toggleModalConfirmDeactivate.bind(this);
		this.toggleModalConfirmActivate =
			this.toggleModalConfirmActivate.bind(this);
		this.toggleModalConfirmApprove = this.toggleModalConfirmApprove.bind(this);
		this.logout = this.logout.bind(this);
		this.uploadImage = this.uploadImage.bind(this);
		this.changePassword = this.changePassword.bind(this);
		this.deactivate = this.deactivate.bind(this);
		this.activate = this.activate.bind(this);
		this.approve = this.approve.bind(this);
	}

	componentDidMount() {
		this.getUserInfo();
	}

	async getUserInfo() {
		try {
			let paramsUsername = this.props.match.params.username;

			let resp;
			if (!paramsUsername) {
				resp = await http.get("/user/info");
			} else {
				resp = await http.get("/user/type");

				this.setState({ currentUserType: resp.data });

				let payload = {
					username: paramsUsername,
				};
				resp = await http.post("/user/info", payload);
			}

			let userInfo = resp.data;

			let prevUsername = userInfo.username;
			let username = userInfo.username;
			let prevEmail = userInfo.email;
			let email = userInfo.email;
			let userType = userInfo.user_type;
			let dateActivated = new Date(userInfo.activated_timestamp);
			let dateLastLogin = new Date(userInfo.last_login_timestamp);
			let prevProfileImage =
				userInfo.profile_image === undefined || userInfo.profile_image === null
					? ""
					: userInfo.profile_image;
			let isUserTypeApproved = userInfo.is_user_type_approved;
			let isDeactivated = userInfo.is_deactivated;

			this.setState({
				prevUsername: prevUsername,
				prevEmail: prevEmail,
				username: username,
				email: email,
				userType: userType,
				dateActivated: dateActivated,
				dateLastLogin: dateLastLogin,
				prevProfileImage: prevProfileImage,
				profileImage: prevProfileImage,
				isUserTypeApproved: isUserTypeApproved,
				isDeactivated: isDeactivated,
			});
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	handleInputChange(e) {
		this.setState({ [e.target.name]: e.target.value });
	}

	formatDate(date) {
		if (date instanceof Date) {
			const offset = date.getTimezoneOffset();
			date = new Date(date.getTime() - offset * 60 * 1000);

			let dd = date.getDate();
			let mm = date.getMonth();
			let yyyy = date.getFullYear();

			if (dd < 10) {
				dd = "0" + dd;
			}

			if (mm < 10) {
				mm = "0" + mm;
			}

			return dd + "/" + mm + "/" + yyyy;
		}
	}

	toggleEditUsername() {
		let prevUsername = this.state.prevUsername;
		let username = this.state.username;

		if (prevUsername !== username) {
			this.setState({ username: prevUsername });
		}

		this.setState((prevState) => ({
			isEditUsernameMode: !prevState.isEditUsernameMode,
		}));
	}

	toggleEditEmail() {
		let prevEmail = this.state.prevEmail;
		let email = this.state.email;

		if (prevEmail !== email) {
			this.setState({ email: prevEmail });
		}
		this.setState((prevState) => ({
			isEditEmailMode: !prevState.isEditEmailMode,
		}));
	}

	async submitUsername() {
		try {
			let username = this.state.username;

			let payload = {
				username: username,
				prev_username: this.state.prevUsername,
			};

			await http.post("/user/username", payload);

			this.setState({ prevUsername: username });

			this.toggleModalConfirmUsername();
			this.toggleEditUsername();
		} catch (err) {
			console.log(err);
			alert("Unable to change your username. Please try again.");
			return err.response;
		}
	}

	async submitEmail() {
		try {
			let email = this.state.email;

			if (!validator.isEmail(email)) {
				alert("Email address is invalid.");
				this.toggleModalConfirmEmail();
				this.toggleEditEmail();
				return;
			}

			let payload = {
				email: email,
				username: this.state.username,
			};

			await http.post("/user/email", payload);

			this.setState({ prevEmail: email });

			this.toggleModalConfirmEmail();
			this.toggleEditEmail();

			this.logout();
		} catch (err) {
			console.log(err);
			alert("Unable to change your email address. Please try again.");
			return err.response;
		}
	}

	toggleModalConfirmUsername() {
		this.setState((prevState) => ({
			isModalConfirmUsernameOpen: !prevState.isModalConfirmUsernameOpen,
		}));
	}

	toggleModalConfirmEmail() {
		this.setState((prevState) => ({
			isModalConfirmEmailOpen: !prevState.isModalConfirmEmailOpen,
		}));
	}

	toggleModalConfirmChangePassword() {
		this.setState((prevState) => ({
			isModalConfirmChangePasswordOpen:
				!prevState.isModalConfirmChangePasswordOpen,
		}));
	}

	toggleModalConfirmDeactivate() {
		this.setState((prevState) => ({
			isModalConfirmDeactivateOpen: !prevState.isModalConfirmDeactivateOpen,
		}));
	}

	toggleModalConfirmActivate() {
		this.setState((prevState) => ({
			isModalConfirmActivateOpen: !prevState.isModalConfirmActivateOpen,
		}));
	}

	toggleModalConfirmApprove() {
		this.setState((prevState) => ({
			isModalConfirmApproveOpen: !prevState.isModalConfirmApproveOpen,
		}));
	}

	logout() {
		http.get("/auth/logout");
		this.props.history.push({
			pathname: "/login",
		});
		this.setState({ username: "" });
		localStorage.clear();
		window.location.reload();
	}

	async uploadImage() {
		try {
			let image = this.state.profileImage;

			let payload = {
				image: image,
				username: this.state.username,
			};

			await http.post("/user/profile-image", payload);
			alert("Profile image changed.");

			this.setState({ prevProfileImage: image });
		} catch (err) {
			console.log(err);
			alert("Unable to upload your profile image. Please try again.");
			return err.response;
		}
	}

	async changePassword() {
		try {
			let payload = {
				username: this.state.username,
			};

			await http.post("/user/change-password", payload);
			alert("Check your email for further instructions.");

			this.toggleModalConfirmChangePassword();
		} catch (err) {
			console.log(err);
			alert("Unable to change your password. Please try again.");
			return err.response;
		}
	}

	async deactivate() {
		try {
			let { currentUsername } = this.state;

			let payload = {
				username: this.state.username,
			};
			await http.post("/user/deactivate", payload);

			this.toggleModalConfirmDeactivate();

			if (currentUsername === payload.username) {
				this.logout();
			}

			this.getUserInfo();
		} catch (err) {
			console.log(err);
			alert("Unable to deactivate. Please try again.");
			return err.response;
		}
	}

	async activate() {
		try {
			let payload = {
				username: this.state.username,
			};
			await http.post("/user/activate", payload);

			this.toggleModalConfirmActivate();

			this.getUserInfo();
		} catch (err) {
			console.log(err);
			alert("Unable to activate. Please try again.");
			return err.response;
		}
	}

	async approve() {
		try {
			let payload = {
				username: this.state.username,
			};
			let resp = await http.post("/user/approve", payload);

			if (resp.status === 200) {
				this.getUserInfo();
			}

			this.toggleModalConfirmApprove();
		} catch (err) {
			alert("Unable to approve. Please try again.");
			return err.response;
		}
	}

	render() {
		let {
			currentUsername,
			currentUserType,
			prevProfileImage,
			profileImage,
			username,
			email,
			userType,
			dateActivated,
			dateLastLogin,
			isUserTypeApproved,
			isDeactivated,
			isEditUsernameMode,
			isEditEmailMode,
			isModalConfirmUsernameOpen,
			isModalConfirmEmailOpen,
			isModalConfirmChangePasswordOpen,
			isModalConfirmDeactivateOpen,
			isModalConfirmActivateOpen,
			isModalConfirmApproveOpen,
		} = this.state;

		const { t } = this.props;

		return (
			<div className="container-edit-profile">
				<Container className="container-user-info" fluid>
					<Row className="heading">{t("User Information")}</Row>

					<Row className="row-content">
						<Col sm={2} className="col-image">
							<Row className="row-user-image">
								{profileImage.length === 0 ? (
									<FaUserCircle size={200} style={{ opacity: 0.9 }} />
								) : (
									<img
										className="user-image"
										src={profileImage}
										alt="Profile"
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
										{t("Choose an Image")}
									</span>
								</ImagePicker>
							</Row>
							<Row
								style={{
									textAlign: "center",
									fontSize: "80%",
									fontStyle: "italic",
								}}
							>
								<span>(500x500px)</span>
							</Row>
							{prevProfileImage !== profileImage ? (
								<Row className="row-upload">
									<Button className="btn-upload" onClick={this.uploadImage}>
										{t("Upload")}
									</Button>
								</Row>
							) : (
								""
							)}
						</Col>
						<Col sm={isEditUsernameMode || isEditEmailMode ? 5 : 4}>
							<Table className="table-user-info">
								<tbody>
									<tr>
										<th style={{ verticalAlign: "middle" }} scope="row">
											{t("Username")}
										</th>
										{isEditUsernameMode ? (
											<td>
												<Input
													type="text"
													name="username"
													id="username"
													onChange={this.handleInputChange}
													value={username}
												/>
											</td>
										) : (
											<td>{username}</td>
										)}
										{userType === "Super Admin" ? (
											""
										) : (
											<>
												{isEditUsernameMode ? (
													<td style={{ textAlign: "right" }}>
														<Button
															color="primary"
															className="btn-submit"
															onClick={this.toggleModalConfirmUsername}
														>
															{t("Submit")}
														</Button>
													</td>
												) : (
													<td className="td-edit">
														<MdModeEdit onClick={this.toggleEditUsername} />
													</td>
												)}
											</>
										)}

										{isEditUsernameMode ? (
											<td>
												<Button
													color="danger"
													className="btn-submit"
													onClick={this.toggleEditUsername}
												>
													{t("Cancel")}
												</Button>
											</td>
										) : (
											""
										)}
									</tr>
									<tr>
										<th style={{ verticalAlign: "middle" }} scope="row">
											{t("Email")}
										</th>
										{isEditEmailMode ? (
											<td>
												<Input
													type="text"
													name="email"
													id="email"
													onChange={this.handleInputChange}
													value={email}
												/>
											</td>
										) : (
											<td>{email}</td>
										)}
										{userType === "Super Admin" ? (
											""
										) : (
											<>
												{isEditEmailMode ? (
													<td style={{ textAlign: "right" }}>
														<Button
															color="primary"
															className="btn-submit"
															onClick={this.toggleModalConfirmEmail}
														>
															{t("Submit")}
														</Button>
													</td>
												) : (
													<td className="td-edit">
														<MdModeEdit onClick={this.toggleEditEmail} />
													</td>
												)}
											</>
										)}
										{isEditEmailMode ? (
											<td>
												<Button
													color="danger"
													className="btn-submit"
													onClick={this.toggleEditEmail}
												>
													{t("Cancel")}
												</Button>
											</td>
										) : (
											""
										)}
									</tr>
									<tr>
										<th scope="row">{t("User Type")}</th>
										<td className={isUserTypeApproved ? "" : "pending"}>
											{t(userType)}
											{isUserTypeApproved ? "" : " (Pending)"}
										</td>
										{isUserTypeApproved ? (
											""
										) : !(
												currentUserType === "Super Admin" ||
												currentUserType === "Admin "
										  ) ? (
											""
										) : (
											<td className="td-approve">
												<Button
													className="btn-approve"
													onClick={this.toggleModalConfirmApprove}
												>
													{t("Approve")}
												</Button>
											</td>
										)}
									</tr>
									<tr>
										<th scope="row">{t("Activated Date")}</th>
										<td>{this.formatDate(dateActivated)}</td>
									</tr>
									<tr>
										<th scope="row">{t("Last Login")}</th>
										<td>{this.formatDate(dateLastLogin)}</td>
									</tr>
									<tr>
										<th scope="row">{t("Status")}</th>
										<td>
											{isDeactivated ? (
												<div className="td-status">
													<span className="red-dot"></span> {t("Inactive")}
												</div>
											) : (
												<div className="td-status">
													<span className="green-dot"></span> {t("Active")}
												</div>
											)}
										</td>
									</tr>
									<tr>
										<td className="td-button">
											<Button
												className="btn-change-password"
												onClick={this.toggleModalConfirmChangePassword}
											>
												{t("Change Password")}
											</Button>
										</td>
										{(currentUsername === username ||
											currentUserType === "Super Admin" ||
											currentUserType === "Admin") &&
										userType !== "Super Admin" ? (
											<td className="td-button">
												{isDeactivated ? (
													<Button
														className="btn-activate"
														onClick={this.toggleModalConfirmActivate}
													>
														{t("Activate")}
													</Button>
												) : (
													<Button
														className="btn-deactivate"
														onClick={this.toggleModalConfirmDeactivate}
													>
														{t("Deactivate")}
													</Button>
												)}
											</td>
										) : (
											<td></td>
										)}
									</tr>
								</tbody>
							</Table>
						</Col>
					</Row>
				</Container>
				<Modal
					isOpen={isModalConfirmUsernameOpen}
					toggle={this.toggleModalConfirmUsername}
				>
					<ModalHeader toggle={this.toggleModalConfirmUsername}>
						{t("Confirm Edit Username")}
					</ModalHeader>
					<ModalFooter>
						<Button color="primary" onClick={this.submitUsername}>
							{t("Confirm")}
						</Button>{" "}
						<Button color="danger" onClick={this.toggleModalConfirmUsername}>
							{t("Cancel")}
						</Button>
					</ModalFooter>
				</Modal>
				<Modal
					isOpen={isModalConfirmEmailOpen}
					toggle={this.toggleModalConfirmEmail}
				>
					<ModalHeader toggle={this.toggleModalConfirmEmail}>
						{t("Confirm Edit Email")}
					</ModalHeader>
					<ModalBody>
						{t("You will be logged out after changing your email address.")}
					</ModalBody>
					<ModalFooter>
						<Button color="primary" onClick={this.submitEmail}>
							{t("Confirm")}
						</Button>{" "}
						<Button color="danger" onClick={this.toggleModalConfirmEmail}>
							{t("Cancel")}
						</Button>
					</ModalFooter>
				</Modal>
				<Modal
					isOpen={isModalConfirmChangePasswordOpen}
					toggle={this.toggleModalConfirmChangePassword}
				>
					<ModalHeader toggle={this.toggleModalConfirmChangePassword}>
						{t("Confirm Change Password")}
					</ModalHeader>
					<ModalBody>
						{t(
							"An email with instructions to change your password will be sent to your email address."
						)}
					</ModalBody>
					<ModalFooter>
						<Button color="primary" onClick={this.changePassword}>
							{t("Confirm")}
						</Button>{" "}
						<Button
							color="danger"
							onClick={this.toggleModalConfirmChangePassword}
						>
							{t("Cancel")}
						</Button>
					</ModalFooter>
				</Modal>
				<Modal
					isOpen={isModalConfirmDeactivateOpen}
					toggle={this.toggleModalConfirmDeactivate}
				>
					<ModalHeader toggle={this.toggleModalConfirmDeactivate}>
						{t("Confirm Deactivate User")}
					</ModalHeader>
					<ModalFooter>
						<Button color="primary" onClick={this.deactivate}>
							{t("Confirm")}
						</Button>{" "}
						<Button color="danger" onClick={this.toggleModalConfirmDeactivate}>
							{t("Cancel")}
						</Button>
					</ModalFooter>
				</Modal>
				<Modal
					isOpen={isModalConfirmActivateOpen}
					toggle={this.toggleModalConfirmActivate}
				>
					<ModalHeader toggle={this.toggleModalConfirmActivate}>
						{t("Confirm Activate User")}
					</ModalHeader>
					<ModalFooter>
						<Button color="primary" onClick={this.activate}>
							{t("Confirm")}
						</Button>{" "}
						<Button color="danger" onClick={this.toggleModalConfirmActivate}>
							{t("Cancel")}
						</Button>
					</ModalFooter>
				</Modal>
				<Modal
					isOpen={isModalConfirmApproveOpen}
					toggle={this.toggleModalConfirmApprove}
				>
					<ModalHeader toggle={this.toggleModalConfirmApprove}>
						{t("Confirm Approve User Type")}
					</ModalHeader>
					<ModalFooter>
						<Button color="primary" onClick={this.approve}>
							{t("Confirm")}
						</Button>{" "}
						<Button color="danger" onClick={this.toggleModalConfirmApprove}>
							{t("Cancel")}
						</Button>
					</ModalFooter>
				</Modal>
			</div>
		);
	}
}

export default withTranslation()(EditProfile);
