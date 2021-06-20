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
import axios from "axios";

class Register extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showPassword: false,
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
			isCredentialsIncorrect: false,
			isUsernameEmpty: false,
			isEmailEmpty: false,
			isEmailValid: false,
			isPasswordEmpty: false,
			isPasswordsMatch: false,
			isUserTypeSelected: false,
		};

		this.handleInputChange = this.handleInputChange.bind(this);
		this.submitRegister = this.submitRegister.bind(this);
	}

	async componentWillMount() {
		let resp = await axios.get(
			process.env.REACT_APP_API_BASE_URL + "/user/user-type"
		);

		let lsUserType = [];
		if (resp.data) {
			lsUserType = resp.data;
		}

		this.setState({ lsUserType: lsUserType });
	}

	toggleShowPassword() {
		this.setState({ showPassword: !this.state.showPassword });
	}

	handleInputChange(e) {
		this.setState({ [e.target.name]: e.target.value });
	}

	async submitRegister() {
		let { username, password } = this.state;

		this.setState({ isCredentialsIncorrect: false });

		if (username.length === 0) {
			this.setState({ isUsernameEmpty: true });
			return;
		} else {
			this.setState({ isUsernameEmpty: false });
		}

		if (password.length === 0) {
			this.setState({ isPasswordEmpty: true });
			return;
		} else {
			this.setState({ isPasswordEmpty: false });
		}

		let resp = await this.postRegister(username, password);

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

			return await axios.post(
				process.env.REACT_APP_API_BASE_URL + "/user/register",
				payload
			);
		} catch (err) {
			console.log(err);
		}
	}

	render() {
		let {
			username,
			password,
			isCredentialsIncorrect,
			isUsernameEmpty,
			isPasswordEmpty,
		} = this.state;

		return (
			<div style={{ backgroundColor: "#f2f3f7", height: "100vh" }}>
				<Container fluid className="container-login">
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
									<Label for="username" sm={3}>
										Username
									</Label>
									<Col sm={9}>
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
									<Label for="password" sm={3}>
										Password
									</Label>
									<Col sm={9}>
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
									<Button className="btn-login" onClick={this.submitRegister}>
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
