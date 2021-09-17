import React from "react";

import "./Navbar.css";
import {
	Collapse,
	Navbar,
	NavbarToggler,
	NavbarBrand,
	Nav,
	NavItem,
	Row,
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	Input,
	Label,
} from "reactstrap";
import { Link, NavLink, withRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";
import { BsFillHouseDoorFill, BsBuilding } from "react-icons/bs";
import {
	FaChartLine,
	FaTachometerAlt,
	FaTemperatureLow,
	FaUserCircle,
} from "react-icons/fa";
import { AiFillFile } from "react-icons/ai";
import { IoIosWater, IoMdShare } from "react-icons/io";
import { BiLinkExternal } from "react-icons/bi";
import { GoTriangleUp, GoTriangleDown } from "react-icons/go";

import http from "../../utils/http";
import validator from "validator";

import { subjectIaqData, apiService } from "../../apiService";

import { withTranslation } from "react-i18next";
import i18n from "../../i18n";

import { lsMonthFull } from "../../utils/months";

const lsDay = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

let subscriberIaqData;

class NavBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
			isUserDropdownOpen: false,
			isLinkDropdownOpen: false,
			currentTime: new Date()
				.toLocaleString([], {
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
				})
				.replace("24:", "00:"),
			username: "",
			lsPermission: [],
			unauthenticatedPathnames: ["/login", "/forgot-password", "/register"],
			temperature: "",
			humidity: "",
			energy: "",
			isFetchingPermissions: false,
			profileImage: "",
			isModalShareOpen: false,
			email: "",
		};

		this.toggleCollapse = this.toggleCollapse.bind(this);
		this.toggleUserDropdown = this.toggleUserDropdown.bind(this);
		this.toggleLinkDropdown = this.toggleLinkDropdown.bind(this);
		this.toggleModalShare = this.toggleModalShare.bind(this);

		this.handleInputChange = this.handleInputChange.bind(this);

		this.logout = this.logout.bind(this);
		this.getUserPermissions = this.getUserPermissions.bind(this);
		this.getUserInfo = this.getUserInfo.bind(this);
		this.getUsername = this.getUsername.bind(this);
		this.share = this.share.bind(this);
		this.getEnergy = this.getEnergy.bind(this);
	}

	async componentDidMount() {
		await this.getUserInfo();
		await this.getEnergy();

		let { unauthenticatedPathnames } = this.state;
		let { pathname } = this.props.location;

		if (!this.state.unauthenticatedPathnames.includes(pathname)) {
			await this.getUserPermissions();
		}

		this.intervalTime = setInterval(
			() =>
				this.setState({
					currentTime: new Date()
						.toLocaleString([], {
							hour: "2-digit",
							minute: "2-digit",
							hour12: false,
						})
						.replace("24:", "00:"),
				}),
			500
		);

		let username = localStorage.getItem("current_username");

		if (username && username !== "") {
			this.setState({ username: localStorage.getItem("current_username") });
		}

		this.unlisten = this.props.history.listen((location, action) => {
			if (
				this.state.username === "" &&
				this.state.unauthenticatedPathnames.indexOf(location.pathname) === -1
			) {
				this.setState({ username: localStorage.getItem("current_username") });
			}
		});

		let start = new Date(new Date().getTime() - 15 * 60 * 1000);
		let end = new Date();

		let dataIaq = subjectIaqData.value;

		if (!dataIaq && !unauthenticatedPathnames.includes(pathname)) {
			await apiService.updateIaqData(start, end);
		}

		subscriberIaqData = subjectIaqData.subscribe(async (dataIaq) => {
			if (!dataIaq) return;
			if (dataIaq.length === 0) return;

			let latestData = dataIaq[dataIaq.length - 1];
			let latestDate = new Date(latestData.data_datetime);

			if (new Date().getTime() - latestDate.getTime() > 900000) {
				start = new Date(dataIaq[0].data_datetime);
				end = new Date();

				await apiService.updateIaqData(start, end);
				return;
			}

			this.setState({
				temperature: parseFloat(latestData.temperature).toFixed(1),
				humidity: parseFloat(latestData.humidity).toFixed(1),
			});
		});

		this.intervalIaq = setInterval(async () => {
			dataIaq = subjectIaqData.value;

			if (!dataIaq) return;
			if (dataIaq.length === 0) {
				let start = new Date(new Date().getTime() - 15 * 60 * 1000);
				let end = new Date();

				await apiService.updateIaqData(start, end);
				return;
			}

			let latestData = dataIaq[dataIaq.length - 1];
			let latestDate = new Date(latestData.data_datetime);

			if (new Date().getTime() - latestDate.getTime() > 900000) {
				start = new Date(dataIaq[0].data_datetime);
				end = new Date();

				await apiService.updateIaqData(start, end);
				return;
			}
		}, 900000);
	}

	async componentDidUpdate() {
		let {
			username,
			unauthenticatedPathnames,
			lsPermission,
			isFetchingPermissions,
		} = this.state;
		let pathname = this.props.history.location.pathname;

		if (!unauthenticatedPathnames.includes(pathname)) {
			if (username === "" || username === null) {
				username = localStorage.getItem("current_username");
				if (username === null) await this.getUsername();
				this.getUserInfo();

				this.setState({ username: username });
			}
			if (lsPermission.length === 0 && !isFetchingPermissions) {
				this.setState({ isFetchingPermissions: true }, () =>
					this.getUserPermissions()
				);
			}
		}
	}

	componentWillUnmount() {
		if (subscriberIaqData) subscriberIaqData.unsubscribe();
		clearInterval(this.intervalTime);
		clearInterval(this.intervalIaq);
		this.unlisten();
	}

	toggleCollapse() {
		this.setState((prevState) => ({
			isOpen: !prevState.isOpen,
		}));
	}

	toggleUserDropdown() {
		this.setState((prevState) => ({
			isUserDropdownOpen: !prevState.isUserDropdownOpen,
		}));
	}

	toggleLinkDropdown() {
		this.setState((prevState) => ({
			isLinkDropdownOpen: !prevState.isLinkDropdownOpen,
		}));
	}

	toggleModalShare() {
		this.setState((prevState) => ({
			isModalShareOpen: !prevState.isModalShareOpen,
		}));
	}

	handleInputChange(e) {
		this.setState({ [e.target.name]: e.target.value });
	}

	logout() {
		http.get("/auth/logout");

		this.setState({ username: "", lsPermission: [] });
		localStorage.clear();

		this.props.history.push({
			pathname: "/login",
		});
	}

	async getUserPermissions() {
		try {
			let resp = await http.get("/permission/");

			this.setState({ lsPermission: resp.data, isFetchingPermissions: false });
			localStorage.setItem("lsPermission", JSON.stringify(resp.data));
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async getUsername() {
		try {
			let resp = await http.get("/user/username/");

			this.setState({ username: resp.data });
			localStorage.setItem("current_username", resp.data);
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async getUserInfo() {
		try {
			let resp = await http.get("/user/info");

			this.setState({
				profileImage:
					resp.data.profile_image === null ? "" : resp.data.profile_image,
			});
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async share() {
		try {
			let email = this.state.email;

			if (!validator.isEmail(email)) {
				alert("Please enter a valid email address");
				return;
			}

			await http.post("/etc/share", { email: this.state.email });

			this.toggleModalShare();
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async getEnergy() {
		try {
			let resp = await http.get("/api/energy");

			this.setState({
				energy: resp.data.energy,
				diff: resp.data.diff,
			});
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	render() {
		let {
			isUserDropdownOpen,
			isLinkDropdownOpen,
			currentTime,
			username,
			temperature,
			humidity,
			lsPermission,
			profileImage,
			isModalShareOpen,
			email,
			energy,
			diff,
		} = this.state;

		let { location } = this.props;

		if (!username) username = "";

		let today = new Date();

		let isDisplayNavbar =
			location.pathname !== "/login" &&
			location.pathname !== "/forgot-password" &&
			location.pathname !== "/register";

		const { t } = this.props;

		return (
			<div
				style={{ height: isDisplayNavbar ? "10%" : 0 }}
				className="wrapper-navbar"
			>
				{!isDisplayNavbar ? (
					<div></div>
				) : (
					<Navbar style={{ backgroundColor: "#F2F3F7" }} light expand="lg">
						<NavbarBrand href="http://www.nida.ac.th" target="_blank">
							<img className="navbar-logo" src="/favicon.ico" alt="logo"></img>
						</NavbarBrand>
						<NavbarBrand href="http://gseda.nida.ac.th" target="_blank">
							<img
								className="navbar-logo-2"
								src="/logo-nes.png"
								alt="log-nes"
							></img>
						</NavbarBrand>
						<NavbarToggler
							className="pull-right"
							onClick={this.toggleCollapse}
						/>
						<Collapse isOpen={this.state.isOpen} navbar>
							<Nav navbar>
								<NavItem>
									<NavLink
										exact
										tag={Link}
										to="/"
										className="nav-link d-flex flex-column"
										activeClassName="activeLink"
										onClick={() => window.history.pushState("", "", "/")}
									>
										<BsFillHouseDoorFill size={40} style={{ margin: "auto" }} />
										{t("Home")}
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										exact
										tag={Link}
										to="/building"
										className="nav-link d-flex flex-column"
										activeClassName="activeLink"
										onClick={() =>
											window.history.pushState("", "", "/building")
										}
									>
										<BsBuilding size={40} style={{ margin: "auto" }} />
										{t("Building")}
									</NavLink>
								</NavItem>
								<NavItem>
									<NavLink
										exact
										tag={Link}
										to="/dashboard"
										className="nav-link d-flex flex-column"
										activeClassName="activeLink"
										onClick={() =>
											window.history.pushState("", "", "/dashboard")
										}
									>
										<FaChartLine size={40} style={{ margin: "auto" }} />
										{t("Dashboard")}
									</NavLink>
								</NavItem>

								{lsPermission.find((p) => p.label === "Generate Report") ? (
									<NavItem>
										<NavLink
											exact
											tag={Link}
											to="/report"
											className="nav-link d-flex flex-column"
											activeClassName="activeLink"
											onClick={() =>
												window.history.pushState("", "", "/report")
											}
										>
											<AiFillFile size={40} style={{ margin: "auto" }} />
											{t("Report")}
										</NavLink>
									</NavItem>
								) : (
									<></>
								)}

								<NavItem>
									<NavLink
										exact
										tag={Link}
										to="/meter"
										className="nav-link d-flex flex-column"
										activeClassName="activeLink"
										onClick={() => window.history.pushState("", "", "/meter")}
									>
										<FaTachometerAlt size={40} style={{ margin: "auto" }} />
										{t("Meter")}
									</NavLink>
								</NavItem>

								<Dropdown
									nav
									isOpen={isUserDropdownOpen}
									toggle={this.toggleUserDropdown}
									style={{
										textAlign: "center",
										width: "fit-content",
									}}
								>
									{profileImage.length === 0 ? (
										<FaUserCircle
											size={40}
											style={{ margin: "auto", opacity: 0.8 }}
										/>
									) : (
										<img
											className="user-image"
											src={profileImage}
											alt="Profile"
										/>
									)}

									<DropdownToggle
										style={{ paddingTop: 0, fontWeight: 600 }}
										nav
										caret
									>
										{username}
									</DropdownToggle>
									<DropdownMenu style={{ width: "200px" }}>
										<DropdownItem>
											<NavLink
												exact
												tag={Link}
												to="/user/edit-profile"
												className="nav-link d-flex flex-column"
												activeClassName="activeLink"
												onClick={() =>
													window.history.pushState("", "", "/user/edit-profile")
												}
											>
												{t("Edit Profile")}
											</NavLink>
										</DropdownItem>

										{lsPermission.find((p) => p.label === "Set Target") ? (
											<DropdownItem>
												<NavLink
													exact
													tag={Link}
													to="/user/set-target"
													className="nav-link d-flex flex-column"
													activeClassName="activeLink"
													onClick={() =>
														window.history.pushState("", "", "/user/set-target")
													}
												>
													{t("Set Target")}
												</NavLink>
											</DropdownItem>
										) : (
											<></>
										)}

										{lsPermission.find(
											(p) => p.label === "Add/Edit/Delete Meter Information"
										) ? (
											<DropdownItem>
												<NavLink
													exact
													tag={Link}
													to="/user/device-manager"
													className="nav-link d-flex flex-column"
													activeClassName="activeLink"
													onClick={() =>
														window.history.pushState(
															"",
															"",
															"/user/device-manager"
														)
													}
												>
													{t("Device Manager")}
												</NavLink>
											</DropdownItem>
										) : (
											<></>
										)}

										{lsPermission.find(
											(p) => p.label === "View Other's Activity Log"
										) ? (
											<DropdownItem>
												<NavLink
													exact
													tag={Link}
													to="/user/activity-log"
													className="nav-link d-flex flex-column"
													activeClassName="activeLink"
													onClick={() =>
														window.history.pushState(
															"",
															"",
															"/user/activity-log"
														)
													}
												>
													{t("Activity Log")}
												</NavLink>
											</DropdownItem>
										) : (
											<></>
										)}

										{lsPermission.find(
											(p) => p.label === "Add/Edit/Delete Other User"
										) ? (
											<DropdownItem>
												<NavLink
													exact
													tag={Link}
													to="/user/user-management"
													className="nav-link d-flex flex-column"
													activeClassName="activeLink"
													onClick={() =>
														window.history.pushState(
															"",
															"",
															"/user/user-management"
														)
													}
												>
													{t("User Management")}
												</NavLink>
											</DropdownItem>
										) : (
											<></>
										)}

										{lsPermission.find((p) => p.label === "Set Permissions") ? (
											<DropdownItem>
												<NavLink
													exact
													tag={Link}
													to="/user/set-permission"
													className="nav-link d-flex flex-column"
													activeClassName="activeLink"
													onClick={() =>
														window.history.pushState(
															"",
															"",
															"/user/set-permission"
														)
													}
												>
													{t("Set Permission")}
												</NavLink>
											</DropdownItem>
										) : (
											<></>
										)}

										<DropdownItem divider />
										<DropdownItem>
											{" "}
											<div onClick={this.logout}>{t("Logout")}</div>
										</DropdownItem>
									</DropdownMenu>
								</Dropdown>

								<Dropdown
									nav
									isOpen={isLinkDropdownOpen}
									toggle={this.toggleLinkDropdown}
									style={{
										textAlign: "center",
										padding: "0.5rem",
									}}
								>
									<BiLinkExternal
										size={40}
										style={{ margin: "auto", opacity: 0.8 }}
									/>
									<DropdownToggle
										style={{ paddingTop: 0, fontWeight: 600 }}
										nav
										caret
									>
										{t("Link")}
									</DropdownToggle>
									<DropdownMenu style={{ width: "220px" }} right>
										<DropdownItem>
											<NavLink
												exact
												tag={Link}
												to={{ pathname: "http://environment.nida.ac.th" }}
												target="_blank"
												className="nav-link d-flex flex-column"
											>
												{t("Website Environmental")}
											</NavLink>
										</DropdownItem>
										<DropdownItem>
											<NavLink
												exact
												tag={Link}
												to={{ pathname: "http://energy.nida.ac.th/" }}
												target="_blank"
												className="nav-link d-flex flex-column"
											>
												{t("Website Energy V1")}
											</NavLink>
										</DropdownItem>
									</DropdownMenu>
								</Dropdown>
								<NavItem
									className="share"
									onClick={() => this.toggleModalShare()}
								>
									<div>{t("Share") + " "}</div>
									<IoMdShare />
								</NavItem>
							</Nav>
						</Collapse>
						<div className="navbar-right">
							<div
								style={{
									width: "fit-content",
									fontWeight: "600",
									color: energy > 0 ? "green" : "red",
								}}
							>
								<Row
									style={{
										justifyContent: "center",
									}}
								>
									{Math.abs(energy) > 10
										? parseFloat(energy).toFixed(1)
										: parseFloat(energy).toFixed(2)}
									%
								</Row>
								<Row style={{ justifyContent: "center", alignItems: "center" }}>
									{energy >= 0 ? <GoTriangleDown /> : <GoTriangleUp />}
								</Row>
							</div>
							<div
								style={{
									width: "120px",
									fontWeight: "600",
								}}
							>
								<Row
									style={{
										justifyContent: "center",
									}}
								>
									{t("Energy")}
								</Row>
								<Row style={{ justifyContent: "center", alignItems: "center" }}>
									{Math.abs(diff) > 1000
										? Math.round(diff)
												.toString()
												.substring(0, Math.round(diff).toString().length - 3) +
										  "k "
										: Math.round(diff) + " "}
									{t("kWh")}
								</Row>
							</div>
							<div
								style={{
									width: "120px",
									fontWeight: "600",
								}}
							>
								<Row
									style={{
										justifyContent: "center",
									}}
								>
									{t("Temperature")}
								</Row>
								<Row style={{ justifyContent: "center", alignItems: "center" }}>
									<FaTemperatureLow />
									{temperature.length > 0 ? temperature : "N/A "}°C
								</Row>
							</div>
							<div style={{ width: "100px", fontWeight: "600" }}>
								<Row
									style={{
										justifyContent: "center",
									}}
								>
									{t("Humidity")}
								</Row>
								<Row style={{ justifyContent: "center", alignItems: "center" }}>
									<IoIosWater />
									{humidity.length > 0 ? humidity : "N/A "}%
								</Row>
							</div>
							<div
								style={{
									width: "fit-content",
									fontWeight: "600",
								}}
							>
								<Row
									style={{
										width: "100%",
										margin: "auto",
									}}
								>
									<span style={{ textAlign: "center" }}>
										{t(`${lsDay[today.getDay()]}`)}
									</span>
								</Row>
								<Row style={{ width: "100%", margin: 0 }}>
									{today.getDate() + " "}
									{t(`${lsMonthFull[today.getMonth()]}`)}
									{" " +
										(i18n.language === "th"
											? today.getFullYear() + 543
											: today.getFullYear())}
								</Row>
							</div>
							<div style={{ fontWeight: "700", marginLeft: "0.5rem" }}>
								<Row
									style={{
										width: "100%",
										margin: 0,
										fontSize: "330%",
									}}
								>
									{currentTime}
								</Row>
							</div>
						</div>
					</Navbar>
				)}
				<Modal isOpen={isModalShareOpen} toggle={this.toggleModalShare}>
					<ModalHeader toggle={this.toggleModalShare}>
						{t("Share to")}...
					</ModalHeader>
					<ModalBody>
						<Label for="email">{t("Email")}</Label>
						<Input
							type="text"
							name="email"
							id="email"
							onChange={this.handleInputChange}
							value={email}
						/>
					</ModalBody>
					<ModalFooter>
						<Button color="primary" onClick={this.share}>
							{t("Share")}
						</Button>{" "}
						<Button color="danger" onClick={this.toggleModalShare}>
							{t("Cancel")}
						</Button>
					</ModalFooter>
				</Modal>
			</div>
		);
	}
}

export default withTranslation()(withRouter(NavBar));
