import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import NavBar from "./components/NavBar/Navbar";
import Home from "./components/Home/Home";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./ScrollToTop";

class App extends React.Component {
	render() {
		return (
			<div>
				<Router>
					<NavBar />
					<ScrollToTop>
						<Switch>
							<Route path="/" component={Home} exact />
						</Switch>
					</ScrollToTop>
				</Router>
				<Footer />
			</div>
		);
	}
}

export default App;
