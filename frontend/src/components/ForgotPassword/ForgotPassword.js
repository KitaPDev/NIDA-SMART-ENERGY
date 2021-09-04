import React from "react";
import "./ForgotPassword.css";
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
import http from "../../utils/http";

import { withTranslation } from "react-i18next";

class ForgotPassword extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: "",
			email: "",
		};

		this.handleInputChange = this.handleInputChange.bind(this);
		this.submitForgotPassword = this.submitForgotPassword.bind(this);
	}

	handleInputChange(e) {
		this.setState({ [e.target.name]: e.target.value });
	}

	async submitForgotPassword() {
		let { username, email } = this.state;

		if (username.length === 0 && email.length === 0) {
			alert("Please fill in either your username or email address.");
			return;
		}

		if (email.length > 0 && !validator.isEmail(email)) {
			alert("Invalid email address.");
			return;
		}

		let resp = await this.postForgotPassword(username, email);

		if (resp.status === 200) {
			alert(
				"Request submitted. Please check your email for further instructions."
			);
			this.props.history.push({
				pathname: "/login",
			});
		} else if (resp.status === 500) {
			alert("Could not reset your password. Please try again");
		} else {
			alert(resp.data);
		}
	}

	async postForgotPassword(username, email) {
		try {
			let payload = {
				username: username,
				email: email,
			};

			return await http.post("/user/forgot-password", payload);
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	render() {
		let { username, email } = this.state;

		const { t } = this.props;

		return (
			<div style={{ backgroundColor: "#f2f3f7", height: "100vh" }}>
				<Container fluid className="container-forgot-password">
					<div className="row-title">
						<span className="col-brand">
							<img className="navbar-logo" src="favicon.ico" alt="logo"></img>
						</span>
						<span className="col-title">NIDA SMART ENERGY</span>
					</div>

					<Container className="container-form">
						<Row className="row-heading">{t("Forgot Password")}</Row>
						<Row>
							<Form>
								<FormGroup row>
									<Label for="username" sm={2}>
										{t("Username")}
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
								<Row className="row-or">{t("or")}</Row>
								<FormGroup row id="fg-email">
									<Label for="email" sm={2}>
										{t("Email")}
									</Label>
									<Col sm={6}>
										<Input
											type="text"
											name="email"
											id="email"
											value={email}
											onChange={this.handleInputChange}
										/>
									</Col>
								</FormGroup>
								<FormGroup row>
									<Button
										id="btn-forgot-password"
										className="btn-forgot-password"
										onClick={this.submitForgotPassword}
									>
										{t("Submit")}
									</Button>
								</FormGroup>
							</Form>
						</Row>

						<Row className="row-login">
							<Link to="/login" className="link">
								{t("Back to Log In")}
							</Link>
						</Row>
					</Container>
				</Container>

				<footer>{t("address")}</footer>
			</div>
		);
	}
}

export default withTranslation()(ForgotPassword);
