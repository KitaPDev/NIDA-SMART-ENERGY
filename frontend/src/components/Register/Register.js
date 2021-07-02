import React from "react";
import "./Register.css";
import {
	Row,
	Col,
	Container,
	Button,
	Form,
	FormGroup,
	Label,
	Input,
} from "reactstrap";
import { Link } from "react-router-dom";
import validator from "validator";
import http from "../../httpService";

class Register extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showPassword: false,
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
			userTypeLabel: "General User",
			isCredentialsIncorrect: false,
			isUsernameEmpty: false,
			isEmailEmpty: false,
			isEmailValid: false,
			isPasswordEmpty: false,
			isPasswordsMatch: false,
			isUserTypeSelected: false,
			loading: false,
		};

		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleInputChangeSelect = this.handleInputChangeSelect.bind(this);
		this.submitRegister = this.submitRegister.bind(this);
		this.setLoading = this.setLoading.bind(this);
	}

	componentWillMount() {
		this.getAllUserType();
	}

	toggleShowPassword() {
		this.setState({ showPassword: !this.state.showPassword });
	}

	handleInputChange(e) {
		this.setState({ [e.target.name]: e.target.value });
	}

	handleInputChangeSelect(e) {
		this.setState({ userTypeLabel: e.target.value });
	}

	async submitRegister() {
		let {
			username,
			email,
			password,
			confirmPassword,
			userTypeLabel,
			lsUserType,
		} = this.state;

		this.setState({ isCredentialsIncorrect: false });

		username.length === 0
			? this.setState({ isUsernameEmpty: true })
			: this.setState({ isUsernameEmpty: false });

		email.length === 0
			? this.setState({ isEmailEmpty: true })
			: this.setState({ isEmailEmpty: false });

		email.length > 0 && !validator.isEmail(email)
			? this.setState({ isEmailValid: true })
			: this.setState({ isEmailValid: false });

		password.length === 0
			? this.setState({ isPasswordEmpty: true })
			: this.setState({ isPasswordEmpty: false });

		let { isUsernameEmpty, isEmailEmpty, isPasswordEmpty, isEmailValid } =
			this.state;

		if (isUsernameEmpty && isEmailEmpty && isPasswordEmpty && isEmailValid) {
			return;
		}

		if (!(password === confirmPassword)) {
			alert("Passwords don't match");
			return;
		}

		let userTypeID;
		for (let userType of lsUserType) {
			if (userType.label === userTypeLabel) {
				userTypeID = userType.id;
				break;
			}
		}

		let resp = await this.postRegister(username, email, password, userTypeID);

		if (resp.status === 200) {
			this.props.history.push({
				pathname: "/login",
			});
		} else if (resp.status === 500) {
			alert("Could not perform registration. Please try again");
		} else {
			this.setState({ isCredentialsIncorrect: true });
		}
	}

	async postRegister(username, email, password, userTypeID) {
		try {
			let payload = {
				username: username,
				email: email,
				password: password,
				user_type_id: userTypeID,
			};

			return await http.post("/user/register", payload);
		} catch (err) {
			console.log(err);
		}
	}

	async getAllUserType() {
		this.setLoading(true);

		try {
			let resp = await http.get("/user/user-type/all");

			let lsUserType = resp.data;
			lsUserType.splice(0, 1);

			this.setState({ lsUserType: lsUserType });
		} catch (err) {
			console.log(err);
		} finally {
			this.setLoading(false);
		}
	}

	setLoading(loading) {
		this.setState({
			loading: loading,
		});
	}

	render() {
		let {
			username,
			email,
			password,
			confirmPassword,
			userTypeLabel,
			isCredentialsIncorrect,
			isUsernameEmpty,
			isEmailEmpty,
			isEmailValid,
			isPasswordEmpty,
			lsUserType,
			loading,
		} = this.state;

		return (
			<div style={{ backgroundColor: "#f2f3f7", height: "100vh" }}>
				<Container fluid className="container-register">
					<Row>
						<Col sm={2} className="col-brand">
							<img className="navbar-logo" src="favicon.ico" alt="logo"></img>
						</Col>
						<Col sm={10} className="col-title">
							NIDA SMART ENERGY
						</Col>
					</Row>

					<Container className="container-form">
						<Row className="row-heading">Register</Row>
						<Row>
							<Form>
								<FormGroup row>
									<Label for="username" sm={2}>
										Username
									</Label>
									<Col sm={6}>
										<Input
											type="text"
											name="username"
											id="username"
											onChange={this.handleInputChange}
											value={username}
										/>
									</Col>
								</FormGroup>
								<FormGroup row>
									<Label for="email" sm={2}>
										Email
									</Label>
									<Col sm={6}>
										<Input
											type="text"
											name="email"
											id="email"
											onChange={this.handleInputChange}
											value={email}
										/>
									</Col>
								</FormGroup>
								<FormGroup row>
									<Label for="password" sm={2}>
										Password
									</Label>
									<Col sm={6}>
										<Input
											type="password"
											name="password"
											id="password"
											value={password}
											onChange={this.handleInputChange}
										/>
									</Col>
								</FormGroup>
								<FormGroup row>
									<Label for="confirmPassword" sm={2}>
										Password
									</Label>
									<Col sm={6}>
										<Input
											type="password"
											name="confirmPassword"
											id="confirmPassword"
											value={confirmPassword}
											onChange={this.handleInputChange}
										/>
									</Col>
								</FormGroup>
								{loading ? (
									""
								) : (
									<FormGroup row>
										<Label for="userType" sm={2}>
											User Type
										</Label>
										<Col sm={6}>
											<Input
												type="select"
												name="userType"
												id="userType"
												value={userTypeLabel}
												onChange={this.handleInputChangeSelect}
											>
												{lsUserType.map((userType) => (
													<option>{userType.label}</option>
												))}
											</Input>
										</Col>
									</FormGroup>
								)}
								<FormGroup row>
									<Button
										id="btn-register"
										className="btn-register"
										onClick={this.submitRegister}
									>
										Register
									</Button>
								</FormGroup>
							</Form>
						</Row>
						{isCredentialsIncorrect ? (
							<Row className="row-feedback">Credentials don't match!</Row>
						) : (
							""
						)}
						{isUsernameEmpty ? (
							<Row className="row-feedback">Please fill in your username.</Row>
						) : (
							""
						)}
						{isEmailEmpty ? (
							<Row className="row-feedback">Please fill in your email.</Row>
						) : (
							""
						)}
						{isEmailValid ? (
							<Row className="row-feedback">Email is invalid.</Row>
						) : (
							""
						)}
						{isPasswordEmpty ? (
							<Row className="row-feedback">Please fill in your password.</Row>
						) : (
							""
						)}

						<Row className="row-login">
							<Link to="/login" className="link">
								Back to Log In
							</Link>
						</Row>
					</Container>
				</Container>

				<footer>
					Address : 148 Seri Thai Rd., Khlong Chan, Bang Kapi, Bangkok 10240 Tel
					: 0-2727-3000
				</footer>
			</div>
		);
	}
}

export default Register;
