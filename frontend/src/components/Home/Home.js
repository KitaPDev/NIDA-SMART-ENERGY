import React from "react";
import "./Home.css";
import { Container, Row, Col } from "reactstrap";
import PieChartEnergySource from "./PieChartEnergySource";
import PieChartElectricalSystem from "./PieChartElectricalSystem";

class Home extends React.Component {
	constructor(props) {
		super(props);

		this.numberWithCommas = this.numberWithCommas.bind(this);
	}

	numberWithCommas(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	render() {
		return (
			<div>
				<Container style={{ paddingTop: "1rem", height: "100vh" }} fluid>
					<Row>
						<Col sm="5">
							<div className="total-energy-consumption-pane">
								<Row
									style={{
										fontSize: "250%",
									}}
								>
									<span>Total</span>
									<span
										style={{
											textTransform: "uppercase",
											fontWeight: "bold",
										}}
									>
										Energy Consumption
									</span>
								</Row>

								<Row>
									<span
										style={{
											fontSize: "250%",
											fontWeight: "600",
											display: "inline-flex",
											alignItems: "center",
										}}
									>
										Today
									</span>
									<span
										style={{
											fontSize: "175%",
											display: "inline-flex",
											alignItems: "center",
											fontWeight: "500",
										}}
									>
										00:00 -{" "}
										{new Date().getHours() + ":" + new Date().getMinutes()}
									</span>
									<span style={{ fontSize: "400%", fontWeight: "bold" }}>
										{this.numberWithCommas(3330)}
									</span>
									<span
										style={{
											fontSize: "175%",
											display: "inline-flex",
											alignItems: "center",
											fontWeight: "500",
											paddingLeft: "0",
										}}
									>
										kWh
									</span>
								</Row>

								<Row>
									<span
										style={{
											color: "#6B6666",
											fontSize: "150%",
											fontWeight: "500",
										}}
									>
										From
									</span>
									<span className="dot-grey" />
									<span style={{ fontSize: "150%", fontWeight: "500" }}>
										MEA
									</span>
									<span className="dot-orange" />
									<span style={{ fontSize: "150%", fontWeight: "500" }}>
										Solar
									</span>

									<span
										style={{
											color: "#6B6666",
											fontSize: "150%",
											fontWeight: "500",
										}}
									>
										Used in
									</span>
									<span className="dot-blue" />
									<span style={{ fontSize: "150%", fontWeight: "500" }}>
										A/C
									</span>
									<span className="dot-red" />
									<span style={{ fontSize: "150%", fontWeight: "500" }}>
										Others
									</span>
								</Row>

								<Row className="row-pie-charts">
									<Col sm="6">
										<PieChartEnergySource mea={90} solar={10} />
									</Col>
									<Col sm="6">
										<PieChartElectricalSystem ac={710} others={515} />
									</Col>
								</Row>
							</div>
						</Col>
						<Col sm="7"></Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default Home;
