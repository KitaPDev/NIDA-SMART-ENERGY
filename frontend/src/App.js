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

class App extends React.Component {
	render() {
		return (
			<div>
				<Router>
					<NavBar />
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
							<Route path="/user/edit-profile" component={EditProfile} exact />
						</Switch>
					</ScrollToTop>
				</Router>
				<Footer />
			</div>
		);
	}
}

export default App;
