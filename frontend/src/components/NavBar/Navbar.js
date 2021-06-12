import React from "react";
import {
	Collapse,
	Navbar,
	NavbarToggler,
	NavbarBrand,
	Nav,
	NavItem,
	Row,
	Col,
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

class NavBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
			isLocaleDropdownOpen: false,
			isUserDropdownOpen: false,
			locale: "English",
			currentTime: new Date().toLocaleString([], {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			}),
		};

		this.toggleCollapse = this.toggleCollapse.bind(this);
		this.toggleLocaleDropdown = this.toggleLocaleDropdown.bind(this);
		this.toggleUserDropdown = this.toggleUserDropdown.bind(this);
		this.changeLocale = this.changeLocale.bind(this);
	}

	componentDidMount() {
		this.interval = setInterval(
			() =>
				this.setState({
					currentTime: new Date().toLocaleString([], {
						hour: "2-digit",
						minute: "2-digit",
						hour12: false,
					}),
				}),
			1000
		);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
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

	render() {
		let { isUserDropdownOpen, isLocaleDropdownOpen, locale, currentTime } =
			this.state;
		let { location } = this.props;

		return (
			<div>
				{location.pathname === "/login" ? (
					<div></div>
				) : (
					<Navbar style={{ backgroundColor: "#F2F3F7" }} light expand="md">
						<NavbarBrand href="/">
							<img className="navbar-logo" src="favicon.ico" alt="logo"></img>
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
								<NavItem>
									<NavLink
										exact
										tag={Link}
										to="/report"
										className="nav-link d-flex flex-column"
										activeClassName="activeLink"
										onClick={() => window.history.pushState("", "", "/report")}
									>
										<AiFillFile size="2em" style={{ margin: "auto" }} />
										Report
									</NavLink>
								</NavItem>
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

									<DropdownToggle style={{ paddingTop: 0 }} nav caret>
										User
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
										<DropdownItem>
											<NavLink
												exact
												tag={Link}
												to="/user/activity-log"
												className="nav-link d-flex flex-column"
												activeClassName="activeLink"
												onClick={() =>
													window.history.pushState("", "", "/user/activity-log")
												}
											>
												Activity Log
											</NavLink>
										</DropdownItem>
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
										<DropdownItem>
											<NavLink
												exact
												tag={Link}
												to="/user/set-permissions"
												className="nav-link d-flex flex-column"
												activeClassName="activeLink"
												onClick={() =>
													window.history.pushState(
														"",
														"",
														"/user/set-permissions"
													)
												}
											>
												Set Permission
											</NavLink>
										</DropdownItem>
										<DropdownItem divider />
										<DropdownItem>Logout</DropdownItem>
									</DropdownMenu>
								</Dropdown>
							</Nav>
						</Collapse>

						<div style={{ marginRight: "2rem" }}>
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
									width: "fit-content",
									justifyContent: "center",
								}}
							>
								Temperature
							</Row>
							<Row>
								<Col sm="2">
									<FaTemperatureLow />
								</Col>
								<Col sm="10">37°C</Col>
							</Row>
						</div>
						<div style={{ width: "100px", fontWeight: "600" }}>
							<Row
								style={{
									width: "fit-content",
									justifyContent: "center",
								}}
							>
								Humidity
							</Row>
							<Row>
								<Col sm="2" style={{ padding: 0 }}>
									<IoIosWater />
								</Col>
								<Col sm="10" style={{ padding: 0 }}>
									48%
								</Col>
							</Row>
						</div>
						<div style={{ width: "100px", fontWeight: "600" }}>
							<Row
								style={{
									width: "100%",
									margin: 0,
								}}
							>
								Wednesday
							</Row>
							<Row style={{ width: "100%", margin: 0 }}>3 June 2020</Row>
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
