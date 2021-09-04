import React from "react";
import "./App.css";

import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import NavBar from "./components/NavBar/Navbar";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Building from "./components/Building/Building";
import Dashboard from "./components/Dashboard/Dashboard";
import Report from "./components/Report/Report";
import Meter from "./components/Meter/Meter";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./ScrollToTop";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import Register from "./components/Register/Register";
import EditProfile from "./components/User/EditProfile/EditProfile";
import SetTarget from "./components/User/SetTarget/SetTarget";
import DeviceManager from "./components/User/DeviceManager/DeviceManager";
import ActivityLog from "./components/User/ActivityLog/ActivityLog";
import UserManagement from "./components/User/UserManagement/UserManagement";
import SetPermission from "./components/User/SetPermission/SetPermission";

import i18n from "./i18n";
import { withTranslation } from "react-i18next";

class App extends React.Component {
	render() {
		const { t } = this.props;

		return (
			<div id="wrapper-root">
				<div className="locale-selector">
					<span onClick={() => i18n.changeLanguage("th")}>{t("TH")}</span>|
					<span onClick={() => i18n.changeLanguage("en")}>{t("ENG")}</span>
				</div>
				<Router>
					<NavBar />
					<div id="wrapper-content">
						<ScrollToTop>
							<Switch>
								<Route path="/login" component={Login} />
								<Route path="/forgot-password" component={ForgotPassword} />
								<Route path="/register" component={Register} />

								<Route path="/" component={Home} exact />
								<Route path="/building" component={Building} exact />
								<Route path="/dashboard" component={Dashboard} exact />
								<Route path="/report" component={Report} exact />
								<Route path="/meter" component={Meter} exact />
								<Route
									path="/user/edit-profile"
									component={EditProfile}
									exact
								/>
								<Route
									path="/user/edit-profile/:username"
									component={EditProfile}
									exact
								/>
								<Route path="/user/set-target" component={SetTarget} exact />
								<Route
									path="/user/device-manager"
									component={DeviceManager}
									exact
								/>
								<Route
									path="/user/activity-log"
									component={ActivityLog}
									exact
								/>
								<Route
									path="/user/user-management"
									component={UserManagement}
									exact
								/>
								<Route
									path="/user/set-permission"
									component={SetPermission}
									exact
								/>
							</Switch>
						</ScrollToTop>
					</div>
				</Router>
				<Footer />
			</div>
		);
	}
}

export default withTranslation()(App);
