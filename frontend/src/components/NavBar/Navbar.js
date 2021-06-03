import React from "react";
import {
	Collapse,
	Navbar,
	NavbarToggler,
	NavbarBrand,
	Nav,
	NavItem,
} from "reactstrap";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import "bootstrap/dist/css/bootstrap.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class NavBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
		};

		this.toggle = this.toggle.bind(this);
	}

	toggle() {
		this.setState((prevState) => ({
			isOpen: !prevState.isOpen,
		}));
	}

	render() {
		return (
			<div>
				<Navbar color="#FFFFFF" light expand="md">
					<NavbarBrand href="/">
						<img className="navbar-logo" src="favicon.ico" alt="logo"></img>
					</NavbarBrand>
					<NavbarToggler className="pull-right" onClick={this.toggle} />
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
									<FontAwesomeIcon icon="fa-solid fa-house" />
									Home
								</NavLink>
							</NavItem>
						</Nav>
					</Collapse>
				</Navbar>
			</div>
		);
	}
}

export default NavBar;
