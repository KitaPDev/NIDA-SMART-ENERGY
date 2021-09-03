import React from "react";
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
} from "reactstrap";
import { Link, NavLink, withRouter } from "react-router-dom";
import "./Navbar.css";
import "bootstrap/dist/css/bootstrap.css";
import { BsFillHouseDoorFill, BsBuilding } from "react-icons/bs";
import {
	FaChartLine,
	FaTachometerAlt,
	FaTemperatureLow,
	FaUserCircle,
} from "react-icons/fa";
import { AiFillFile } from "react-icons/ai";
import { IoIosWater } from "react-icons/io";
import http from "../../utils/http";
import { subjectIaqData, apiService } from "../../apiService";

const lsMonthName = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

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
			isLocaleDropdownOpen: false,
			isUserDropdownOpen: false,
			locale: "English",
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
			isFetchingPermissions: false,
		};

		this.toggleCollapse = this.toggleCollapse.bind(this);
		this.toggleLocaleDropdown = this.toggleLocaleDropdown.bind(this);
		this.toggleUserDropdown = this.toggleUserDropdown.bind(this);
		this.changeLocale = this.changeLocale.bind(this);
		this.logout = this.logout.bind(this);
		this.getUserPermissions = this.getUserPermissions.bind(this);
		this.getUsername = this.getUsername.bind(this);
	}

	async componentDidMount() {
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

	toggleLocaleDropdown() {
		this.setState((prevState) => ({
			isLocaleDropdownOpen: !prevState.isLocaleDropdownOpen,
		}));
	}

	toggleUserDropdown() {
		this.setState((prevState) => ({
			isUserDropdownOpen: !prevState.isUserDropdownOpen,
		}));
	}

	changeLocale(e) {
		this.setState({
			locale: e.currentTarget.textContent,
		});
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
			localStorage.setItem("lsPermission", resp.data);
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

	render() {
		let {
			isUserDropdownOpen,
			isLocaleDropdownOpen,
			locale,
			currentTime,
			username,
			temperature,
			humidity,
			lsPermission,
		} = this.state;

		let { location } = this.props;

		if (!username) username = "";

		let today = new Date();

		let isDisplayNavbar =
			location.pathname !== "/login" &&
			location.pathname !== "/forgot-password" &&
			location.pathname !== "/register";

		return (
			<div style={{ height: isDisplayNavbar ? "10%" : 0 }}>
				{!isDisplayNavbar ? (
					<div></div>
				) : (
					<Navbar style={{ backgroundColor: "#F2F3F7" }} light expand="md">
						<NavbarBrand href="/">
							<img className="navbar-logo" src="/favicon.ico" alt="logo"></img>
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
										<BsFillHouseDoorFill
											size="2em"
											style={{ margin: "auto" }}
										/>
										Home
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
										<BsBuilding size="2em" style={{ margin: "auto" }} />
										Building
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
										<FaChartLine size="2em" style={{ margin: "auto" }} />
										Dashboard
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
											<AiFillFile size="2em" style={{ margin: "auto" }} />
											Report
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
										<FaTachometerAlt size="2em" style={{ margin: "auto" }} />
										Meter
									</NavLink>
								</NavItem>

								<Dropdown
									nav
									isOpen={isUserDropdownOpen}
									toggle={this.toggleUserDropdown}
									style={{
										textAlign: "center",
										padding: "0.5rem",
										width: "100px",
									}}
								>
									<FaUserCircle
										size="2em"
										style={{ margin: "auto", opacity: 0.8 }}
									/>

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
												Edit Profile
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
													Set Target
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
													Device Manager
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
													Activity Log
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
													User Management
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
													Set Permission
												</NavLink>
											</DropdownItem>
										) : (
											<></>
										)}

										<DropdownItem divider />
										<DropdownItem>
											{" "}
											<div onClick={this.logout}>Logout</div>
										</DropdownItem>
									</DropdownMenu>
								</Dropdown>
							</Nav>
						</Collapse>

						<div className="locale-toggler">
							<Dropdown
								isOpen={isLocaleDropdownOpen}
								toggle={this.toggleLocaleDropdown}
							>
								<DropdownToggle color="transparent" caret>
									{locale}
								</DropdownToggle>
								<DropdownMenu>
									<DropdownItem onClick={this.changeLocale}>
										English
									</DropdownItem>
									<DropdownItem onClick={this.changeLocale}>Thai</DropdownItem>
								</DropdownMenu>
							</Dropdown>
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
								Temperature
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
								Humidity
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
									{lsDay[today.getDay()]}
								</span>
							</Row>
							<Row style={{ width: "100%", margin: 0 }}>
								{today.getDate() +
									" " +
									lsMonthName[today.getMonth()] +
									" " +
									today.getFullYear()}
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
					</Navbar>
				)}
			</div>
		);
	}
}

export default withRouter(NavBar);
