import React from "react";
import "./Home.css";
import { Container, Row, Col, Progress } from "reactstrap";
import PieChartEnergySource from "./PieChartEnergySource/PieChartEnergySource";
import PieChartElectricalSystem from "./PieChartElectricalSystem/PieChartElectricalSystem";
import LineChartBuildingPowerConsumption from "./LineChartBuildingPowerConsumption/LineChartBuildingPowerConsumption";
import BarChartElectricalSystemPowerConsumption from "./BarChartElectricalSystemPowerConsumption/BarChartElectricalSystemPowerConsumption";

class Home extends React.Component {
	constructor(props) {
		super(props);

		this.numberWithCommas = this.numberWithCommas.bind(this);
	}

	numberWithCommas(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	render() {
		let target = 600000;
		let electricityBill = 350000;
		let solarSavings = 10000;

		let lsLogPower_Building = {
			Navamin: [
				{ log_timestamp: "2021-06-08T00:00:00Z", ac: 18, others: 12 },
				{ log_timestamp: "2021-06-08T00:15:00Z", ac: 13, others: 11 },
				{ log_timestamp: "2021-06-08T00:30:00Z", ac: 14, others: 14 },
				{ log_timestamp: "2021-06-08T00:45:00Z", ac: 12, others: 15 },
				{ log_timestamp: "2021-06-08T01:00:00Z", ac: 18, others: 14 },
				{ log_timestamp: "2021-06-08T01:15:00Z", ac: 19, others: 13 },
				{ log_timestamp: "2021-06-08T01:30:00Z", ac: 15, others: 12 },
				{ log_timestamp: "2021-06-08T01:45:00Z", ac: 16, others: 11 },
				{ log_timestamp: "2021-06-08T02:00:00Z", ac: 17, others: 12 },
				{ log_timestamp: "2021-06-08T02:15:00Z", ac: 11, others: 10 },
			],
			Auditorium: [
				{ log_timestamp: "2021-06-08T00:00:00Z", ac: 16, others: 1 },
				{ log_timestamp: "2021-06-08T00:15:00Z", ac: 14, others: 3 },
				{ log_timestamp: "2021-06-08T00:30:00Z", ac: 5, others: 2 },
				{ log_timestamp: "2021-06-08T00:45:00Z", ac: 8, others: 6 },
				{ log_timestamp: "2021-06-08T01:00:00Z", ac: 9, others: 7 },
				{ log_timestamp: "2021-06-08T01:15:00Z", ac: 3, others: 9 },
				{ log_timestamp: "2021-06-08T01:30:00Z", ac: 4, others: 5 },
				{ log_timestamp: "2021-06-08T01:45:00Z", ac: 7, others: 3 },
				{ log_timestamp: "2021-06-08T02:00:00Z", ac: 11, others: 1 },
				{ log_timestamp: "2021-06-08T02:15:00Z", ac: 19, others: 5 },
			],
		};

		return (
			<div>
				<Container style={{ padding: "1rem" }} fluid>
					{/* ******************************** LEFT COLUMN ******************************** */}
					<Col sm="5">
						{/* ******************************** ENERGY CONSUMPTION PANE ******************************** */}
						<div className="total-energy-consumption-pane">
							<Row
								style={{
									fontSize: "160%",
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
										fontSize: "160%",
										fontWeight: "600",
										display: "inline-flex",
										alignItems: "center",
									}}
								>
									Today
								</span>
								<span
									style={{
										fontSize: "125%",
										display: "inline-flex",
										alignItems: "center",
										fontWeight: "500",
									}}
								>
									00:00 -{" "}
									{new Date().toLocaleString([], {
										hour: "2-digit",
										minute: "2-digit",
										hour12: false,
									})}
								</span>
								<span style={{ fontSize: "200%", fontWeight: "bold" }}>
									{this.numberWithCommas(3330)}
								</span>
								<span
									style={{
										fontSize: "125%",
										display: "inline-flex",
										alignItems: "center",
										fontWeight: "600",
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
										fontWeight: "600",
										marginLeft: "5%",
									}}
								>
									From
								</span>
								<span className="dot-grey" />
								<span style={{ color: "#757272", fontWeight: "500" }}>MEA</span>
								<span className="dot-orange" />
								<span style={{ color: "#757272", fontWeight: "500" }}>
									Solar
								</span>

								<span
									style={{
										color: "#6B6666",
										fontWeight: "600",
										marginLeft: "15%",
									}}
								>
									Used in
								</span>
								<span className="dot-blue" />
								<span style={{ color: "#757272", fontWeight: "500" }}>A/C</span>
								<span className="dot-red" />
								<span style={{ color: "#757272", fontWeight: "500" }}>
									Others
								</span>
							</Row>

							<Row className="row-pie-charts">
								<Col sm="6">
									<PieChartEnergySource mea={80} solar={20} />
								</Col>
								<Col sm="6">
									<PieChartElectricalSystem
										ac={710}
										others={515}
										building={"Navamin".toUpperCase()}
									/>
								</Col>
							</Row>
						</div>
						{/* ******************************** ELECTRICITY BILL PANE ******************************** */}
						<div className="electricity-bill-pane">
							<Row>
								<Col sm="6">
									<span
										style={{
											fontSize: "150%",
											fontWeight: "600",
											display: "inline-flex",
											alignItems: "center",
										}}
									>
										Electricity Bill
									</span>
									<span
										style={{
											fontSize: "125%",
											display: "inline-flex",
											alignItems: "center",
											fontWeight: "500",
											paddingLeft: "1rem",
										}}
									>
										Month to Date
									</span>
								</Col>
								<Col sm="6" style={{ textAlign: "right" }}>
									<span
										style={{
											fontSize: "150%",
											fontWeight: "600",
											display: "inline-flex",
											alignItems: "center",
										}}
									>
										Total
									</span>
									<span
										style={{
											fontSize: "150%",
											fontWeight: "600",
											display: "inline-flex",
											alignItems: "center",
											paddingLeft: "1rem",
										}}
									>
										฿{this.numberWithCommas(electricityBill - solarSavings)}
									</span>
								</Col>
							</Row>
							<Row style={{ textAlign: "center", fontWeight: "bold" }}>
								<Col sm="3" style={{ color: "#DAA407" }}>
									<span>Saved From Solar</span>
								</Col>
								<Col sm="6" style={{ color: "#899CA2" }}>
									<span>% Electricity Used Month Target</span>
								</Col>
								<Col sm="3">
									<span>Target</span>
								</Col>
							</Row>
							<Row style={{ textAlign: "center", fontWeight: "bold" }}>
								<Col sm="3" style={{ color: "#FFC121" }}>
									<span>฿ {this.numberWithCommas(solarSavings)}</span>
								</Col>
								<Col sm="6" style={{ color: "#899CA2" }}>
									<span>{Math.round((electricityBill / target) * 100)}%</span>
								</Col>
								<Col sm="3">
									<span>฿ {this.numberWithCommas(target)}</span>
								</Col>
							</Row>
							<Row className="row-progress" style={{ paddingBottom: 0 }}>
								<Col sm="3" style={{ paddingRight: 0 }}>
									<Progress
										color="warning"
										value={(solarSavings / target) * 100}
										style={{
											backgroundColor: "white",
											borderRadius: "0",
											direction: "rtl",
											height: "20px",
										}}
									></Progress>
								</Col>
								<Col sm="8" style={{ paddingLeft: 0 }}>
									<Progress
										color={electricityBill > target ? "danger" : "success"}
										value={(electricityBill / target) * 100}
										style={{
											backgroundColor: "white",
											border: "solid 1px",
											borderRadius: "0",
											height: "20px",
											fontWeight: "bold",
										}}
									>
										฿ {this.numberWithCommas(electricityBill)}
									</Progress>
								</Col>
								<Col sm="1"></Col>
							</Row>
						</div>
						{/* ******************************** BUILDING POWER CONSUMPTION PANE ******************************** */}
						<div className="building-power-consumption-pane">
							<Row>
								<span style={{ fontWeight: "bold" }}>
									Power Consumption by Building (kW)
								</span>
							</Row>
							<Row>
								<LineChartBuildingPowerConsumption
									lsLogPower_Building={lsLogPower_Building}
								/>
							</Row>
						</div>
						{/* ******************************** ELECTRICAL SYSTEM POWER CONSUMPTION PANE ******************************** */}
						<div className="electrical-system-power-consumption-pane">
							<Row>
								<span style={{ fontWeight: "bold" }}>
									Power Consumption by Electrical System (kW)
								</span>
							</Row>
							<Row>
								<BarChartElectricalSystemPowerConsumption
									lsLogPower_Building={lsLogPower_Building}
								/>
							</Row>
						</div>
					</Col>

					{/* ******************************** RIGHT COLUMN ******************************** */}
					<Col sm="7">
						<div className="map-campus"></div>
					</Col>
				</Container>
			</div>
		);
	}
}

export default Home;
