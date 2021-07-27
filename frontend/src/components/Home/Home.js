import React from "react";
import "./Home.css";
import { Container, Row, Col, Progress } from "reactstrap";
import PieChartEnergySource from "./PieChartEnergySource/PieChartEnergySource";
import PieChartSystem from "./PieChartSystem/PieChartSystem";
import LineChartBuildingPowerConsumption from "./LineChartBuildingPowerConsumption/LineChartBuildingPowerConsumption";
import BarChartSystemPowerConsumption from "./BarChartSystemPowerConsumption/BarChartSystemPowerConsumption";
import http from "../../utils/http";
import {
	subjectPowerMeterData,
	subjectSolarData,
	apiService,
} from "../../apiService";

let subscriberPowerMeterData;
let subscriberSolarData;

class Home extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			lsSelectedBuilding: [],
			lsSystem: [],
			costCoef_building: {},
			kwh_system_building: {},
			lsKw_system_building: {},
			bill_building: 0,
			kwhSolar: 0,
			lsBuilding: [],
			currentTime: new Date()
				.toLocaleString([], {
					hour: "2-digit",
					minute: "2-digit",
					hour12: false,
				})
				.replace("24:", "00:"),
			buildingPath: window.location.origin + "/building/",
			propsPath: window.location.origin + "/props/",
		};

		this.numberWithCommas = this.numberWithCommas.bind(this);
		this.getAllSystem = this.getAllSystem.bind(this);
		this.getBuildingCostCoefficient =
			this.getBuildingCostCoefficient.bind(this);
		this.getAllBuilding = this.getAllBuilding.bind(this);
		this.onClickBuilding = this.onClickBuilding.bind(this);
		this.calculateKwh_systemBuilding_electricityBill =
			this.calculateKwh_systemBuilding_electricityBill.bind(this);
	}

	numberWithCommas(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	async componentDidMount() {
		await this.getAllSystem();
		await this.getBuildingCostCoefficient();
		this.getAllBuilding();

		let { costCoef_building } = this.state;

		let today = new Date();
		let startDate = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate(),
			0,
			0,
			0
		);
		let endDate = new Date();

		apiService.updatePowerMeterData(startDate, endDate);
		apiService.updateSolarData(startDate, endDate);

		subscriberPowerMeterData = subjectPowerMeterData.subscribe((dataPower) => {
			let kwh_system_building = {};
			let lsKw_system_building = {};
			let bill_building = {};

			if (dataPower === undefined) {
				return;
			}

			let lsDeviceFirst = [];
			let lsDeviceLast = [];

			for (let data of dataPower.slice().reverse()) {
				let datetime = new Date(data.data_datetime);
				let building = data.building;
				let device = data.device;
				let kw = Math.round((data.kw * 100) / 100);
				let kwh = Math.round((data.kwh * 100) / 100);
				let system = data.system;

				if (lsKw_system_building[building] === undefined)
					lsKw_system_building[building] = {};

				if (lsKw_system_building[building][system] === undefined)
					lsKw_system_building[building][system] = [];

				lsKw_system_building[building][system].push({
					datetime: datetime,
					kw: kw,
				});

				if (!lsDeviceLast.find((d) => d === device)) {
					lsDeviceLast.push(device);
				} else {
					continue;
				}

				if (kwh_system_building[building] === undefined)
					kwh_system_building[building] = {};

				if (kwh_system_building[building][system] === undefined)
					kwh_system_building[building][system] = 0;

				if (building === "Naradhip") console.log(device + ": " + kwh);

				kwh_system_building[building][system] += kwh;
			}

			for (let data of dataPower) {
				let building = data.building;
				let device = data.device;
				let kw = Math.round((data.kw * 100) / 100);
				let kwh = Math.round((data.kwh * 100) / 100);
				let system = data.system;

				if (!lsDeviceFirst.find((d) => d === device)) {
					lsDeviceFirst.push(device);
				} else {
					break;
				}

				kwh_system_building[building][system] -= kwh;
			}

			for (let [building, kwh_system] of Object.entries(kwh_system_building)) {
				let costCoef = 4;
				if (costCoef_building[building] !== undefined) {
					costCoef = costCoef_building[building];
				}

				if (bill_building[building] === undefined) bill_building[building] = 0;
				for (let [, kwh] of Object.entries(kwh_system)) {
					if (kwh > 0) bill_building[building] += kwh * costCoef;
				}
			}

			this.setState({
				kwh_system_building: kwh_system_building,
				lsKw_system_building: lsKw_system_building,
				bill_building: bill_building,
			});
		});

		subscriberSolarData = subjectSolarData.subscribe((dataSolar) => {
			let kwhSolar = 0;

			if (dataSolar === undefined) {
				return;
			}
		});

		this.interval = setInterval(
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

		this.interval = setInterval(() => {
			apiService.updatePowerMeterData();
			apiService.updateSolarData();
		}, 900000);
	}

	componentWillUnmount() {
		if (subscriberPowerMeterData) subscriberPowerMeterData.unsubscribe();
		if (subscriberSolarData) subscriberSolarData.unsubscribe();
	}

	async getAllSystem() {
		try {
			let resp = await http.get("/system/all");

			this.setState({ lsSystem: resp.data });
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async getBuildingCostCoefficient() {
		try {
			let today = new Date();
			let payload = {
				month: today.getMonth() + 1,
				year: today.getFullYear(),
			};

			let resp = await http.post("/target/monthyear/coef", payload);

			this.setState({ costCoef_building: resp.data });
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async getAllBuilding() {
		try {
			let resp = await http.get("/building/all");

			this.setState({ lsBuilding: resp.data });
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	onClickBuilding(building) {
		let { lsSelectedBuilding, lsBuilding } = this.state;

		if (lsSelectedBuilding.length === lsBuilding.length) {
			lsSelectedBuilding = [building];
		} else if (!lsSelectedBuilding.includes(building)) {
			lsSelectedBuilding.push(building);
			this.setState({ lsSelectedBuilding: lsSelectedBuilding });
		} else {
			lsSelectedBuilding = lsSelectedBuilding.filter((b) => b !== building);
		}

		this.setState({ lsSelectedBuilding: lsSelectedBuilding });
	}

	calculateKwh_systemBuilding_electricityBill() {
		let { lsSystem, lsLogPower_Building, costCoef_building } = this.state;

		// kwh has two attributes
		// First and Last
		// Why? Last - First = Total kwh within the time period
		let kwh_device_system_building = {};
		let kwh_system_building = {};

		for (let [building, lsLogPower] of Object.entries(lsLogPower_Building)) {
			kwh_device_system_building[building] = {};
			kwh_system_building[building] = {};

			for (let system of lsSystem) {
				kwh_device_system_building[building][system.label] = {};
			}

			for (let log of lsLogPower) {
				let system = log.system;
				let device = log.device;
				let kwh_device = kwh_device_system_building[building][system];

				if (kwh_device[device] === undefined) {
					kwh_device[device] = { first: log.kwh };
				}
			}

			for (let i = lsLogPower.length - 1; i >= 0; i--) {
				let log = lsLogPower[i];

				let system = log.system;
				let device = log.device;
				let kwh_device = kwh_device_system_building[building][system];

				if (kwh_device[device]["last"] === undefined) {
					kwh_device[device]["last"] = log.kwh;
				}
			}
		}

		let electricityBill = 0;

		for (let [building, kwh_system_device] of Object.entries(
			kwh_device_system_building
		)) {
			let costCoef = 4;
			if (costCoef_building[building] !== undefined) {
				costCoef = costCoef_building[building];
			}

			let kwh_system = kwh_system_building[building];

			for (let system of lsSystem) {
				for (let kwh of Object.values(kwh_system_device[system.label])) {
					if (kwh_system[system.label] === undefined) {
						kwh_system[system.label] = 0;
					}

					let kwhDiff = kwh["last"] - kwh["first"];

					kwh_system[system.label] += kwhDiff;

					if (system.label === "Main") {
						electricityBill += kwhDiff;
					}
				}
			}
		}

		return { kwh_system_building, electricityBill };
	}

	render() {
		let {
			currentTime,
			propsPath,
			buildingPath,
			lsBuilding,
			lsSelectedBuilding,
			kwh_system_building,
			lsKw_system_building,
			kwhSolar,
			electricityBill,
		} = this.state;

		let kwhMain = 0;
		let kwhAc = 0;

		if (lsSelectedBuilding.length === 0) {
			lsSelectedBuilding = lsBuilding.map((building) => building.label);
		}

		for (let building of lsSelectedBuilding) {
			if (kwh_system_building[building]) {
				if (kwh_system_building[building]["Main"])
					kwhMain += kwh_system_building[building]["Main"];

				if (kwh_system_building[building]["Air Conditioner"])
					kwhAc += kwh_system_building[building]["Air Conditioner"];
			}
		}

		if (electricityBill === undefined) {
			electricityBill = 0;
		}

		let target = 600000;

		return (
			<div>
				<Container style={{ padding: "1rem" }} fluid>
					<Row>
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
										00:00 - {currentTime}
									</span>
									<span style={{ fontSize: "200%", fontWeight: "bold" }}>
										{this.numberWithCommas(Math.round(kwhMain))}
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
									<span
										style={{
											color: "#757272",
											fontWeight: "500",
											paddingLeft: "0.3rem",
										}}
									>
										MEA
									</span>
									<span className="dot-orange" />
									<span
										style={{
											color: "#757272",
											fontWeight: "500",
											paddingLeft: "0.3rem",
										}}
									>
										Solar Cells
									</span>

									<span
										style={{
											color: "#6B6666",
											fontWeight: "600",
											marginLeft: "5%",
										}}
									>
										Used in
									</span>
									<span className="dot-blue" />
									<span
										style={{
											color: "#757272",
											fontWeight: "500",
											paddingLeft: "0.3rem",
										}}
									>
										Air Conditioner
									</span>
									<span className="dot-red" />
									<span
										style={{
											color: "#757272",
											fontWeight: "500",
											paddingLeft: "0.3rem",
										}}
									>
										Others
									</span>
								</Row>

								<Row className="row-pie-charts">
									<Col sm="6">
										<PieChartEnergySource mea={kwhMain} solar={kwhSolar} />
									</Col>
									<Col sm="6">
										<PieChartSystem
											ac={kwhAc}
											others={kwhMain - kwhAc}
											building={
												lsSelectedBuilding.length === 1
													? ""
													: lsSelectedBuilding[0]
											}
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
											฿
											{this.numberWithCommas(
												parseFloat((kwhMain - kwhSolar) * 4).toFixed(2)
											)}
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
										<span>฿ {this.numberWithCommas(kwhSolar * 4)}</span>
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
											value={((kwhSolar * 4) / target) * 100}
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
										lsKw_system_building={lsKw_system_building}
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
									{/* <BarChartSystemPowerConsumption
										lsLogPower_Building={lsLogPower_Building}
									/> */}
								</Row>
							</div>
						</Col>

						{/* ******************************** RIGHT COLUMN ******************************** */}
						<Col sm="7" style={{ height: "100%" }}>
							<div className="map-campus">
								<img
									className="img-road-1"
									src={propsPath + "road1.png"}
									alt={"road.png"}
								></img>
								<img
									className="img-road-2"
									src={propsPath + "road2.png"}
									alt={"road2.png"}
								></img>
								<img
									className="img-road-campus"
									src={propsPath + "road-campus.png"}
									alt={"in-road.png"}
								></img>
								<img
									className="img-field"
									src={propsPath + "field.png"}
									alt={"field.png"}
								></img>
								<img
									className="img-pond"
									src={propsPath + "pond.png"}
									alt={"pond.png"}
								></img>
								<img
									className="img-trees"
									src={propsPath + "trees.png"}
									alt={"trees.png"}
								></img>
								{lsBuilding.map((building) => (
									<img
										className={
											"img-" +
											building.label.toLowerCase().replace(" ", "-") +
											" img-building"
										}
										src={
											buildingPath +
											building.label +
											"/" +
											building.label +
											".png"
										}
										alt={building.label + ".png"}
										onClick={() => this.onClickBuilding(building.label)}
									></img>
								))}
							</div>
							<div className="footer">
								<Row style={{ height: "100%" }}>
									<Col sm="6" style={{ display: "flex" }}>
										<span
											style={{
												alignSelf: "flex-end",
											}}
										>
											*
										</span>
										<span
											style={{
												textDecoration: "underline",
												alignSelf: "flex-end",
											}}
										>
											*Note:
										</span>
										<span
											style={{
												alignSelf: "flex-end",
												marginLeft: "0.2rem",
											}}
										>
											Electricity bill is estimated
										</span>
									</Col>
									<Col sm="3" style={{ verticalAlign: "bottom" }}>
										<Row
											style={{
												marginTop: "2rem",
												fontWeight: "bold",
												justifyContent: "center",
												marginBottom: 0,
											}}
										>
											Color Legend
										</Row>
										<Row
											style={{
												marginBottom: 0,
												justifyContent: "center",
											}}
										>
											*From Total Energy
										</Row>
									</Col>
									<Col sm="3">
										<Row>
											<Container className="dot-container">
												<div className="legend-dot-1"></div>
											</Container>
											<Container className="dot-container">
												<div className="legend-dot-2"></div>
											</Container>
											<Container className="dot-container">
												<div className="legend-dot-3"></div>
											</Container>
										</Row>
										<Row>
											<div className="legend gradient"></div>
										</Row>
										<Row
											style={{
												justifyContent: "center",
												paddingLeft: "0.5rem",
											}}
										>
											<span className="legend-percentage">0%</span>
											<span className="legend-percentage">10%</span>
											<span className="legend-percentage">40%</span>
											<span className="legend-percentage">100%</span>
										</Row>
									</Col>
								</Row>
							</div>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default Home;
