import React from "react";
import "./Home.css";
import { Container, Row, Col, Progress } from "reactstrap";
import PieChartEnergySource from "./PieChartEnergySource/PieChartEnergySource";
import PieChartElectricalSystem from "./PieChartElectricalSystem/PieChartElectricalSystem";
import LineChartBuildingPowerConsumption from "./LineChartBuildingPowerConsumption/LineChartBuildingPowerConsumption";
import BarChartElectricalSystemPowerConsumption from "./BarChartElectricalSystemPowerConsumption/BarChartElectricalSystemPowerConsumption";
import http from "../../utils/http";

class Home extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			lsSelectedBuilding: [],
			lsElectricalSystem: [],
			mapCostCoef_building: {},
			lsBuilding: [],
			lsLogPower_Building: [],
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
		this.getAllElectricalSystem = this.getAllElectricalSystem.bind(this);
		this.getBuildingCostCoefficient =
			this.getBuildingCostCoefficient.bind(this);
		this.getAllBuilding = this.getAllBuilding.bind(this);
		this.getPowerData = this.getPowerData.bind(this);
		this.onClickBuilding = this.onClickBuilding.bind(this);
		this.calculateKwhMainAcSolarElectricityBill =
			this.calculateKwhMainAcSolarElectricityBill.bind(this);
	}

	numberWithCommas(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	componentDidMount() {
		this.getAllElectricalSystem();
		this.getBuildingCostCoefficient();
		this.getAllBuilding();
		this.getPowerData();

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

		this.interval = setInterval(() => this.getPowerData(), 900000);
	}

	async getAllElectricalSystem() {
		try {
			let resp = await http.get("/electricalSystem/all");

			this.setState({ lsElectricalSystem: resp.data });
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

			this.setState({ mapCostCoef_building: resp.data });
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

	async getPowerData() {
		try {
			let today = new Date();

			let payload = {
				start: new Date(
					today.getFullYear(),
					today.getMonth(),
					today.getDate(),
					0,
					0,
					0
				),
				end: new Date(),
			};

			let resp = await http.post("/building/power/datetime", payload);

			let lsPowerData = resp.data;
			let lsLogPower_Building = [];

			for (let data of lsPowerData) {
				if (lsLogPower_Building[data.building] === undefined) {
					lsLogPower_Building[data.building] = [];
				}

				lsLogPower_Building[data.building].push({
					data_datetime: data.data_datetime,
					floor: data.floor,
					device: data.device,
					system: data.system,
					kw: data.kw,
					kwh: data.kwh,
				});
			}

			this.setState({
				lsLogPower_Building: lsLogPower_Building,
			});
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	onClickBuilding(building) {
		let { lsSelectedBuilding } = this.state;

		if (!lsSelectedBuilding.includes(building)) {
			lsSelectedBuilding.push(building);
			this.setState({ lsSelectedBuilding: lsSelectedBuilding });
		} else {
			this.setState({
				lsSelectedBuilding: lsSelectedBuilding.filter((b) => b !== building),
			});
		}
	}

	calculateKwhMainAcSolarElectricityBill() {
		let {
			lsSelectedBuilding,
			lsElectricalSystem,
			lsLogPower_Building,
			mapCostCoef_building,
		} = this.state;

		// kwh has two attributes
		// First and Last
		// Why? Last - First = Total kwh within the time period
		let kwh_building_system_device = {};

		for (let [building, lsLogPower] of Object.entries(lsLogPower_Building)) {
			if (lsSelectedBuilding.length > 0) {
				if (!lsSelectedBuilding.includes(building)) continue;
			}

			for (let system of lsElectricalSystem) {
				kwh_building_system_device[building] = {
					[system]: {},
				};
			}

			for (let log of lsLogPower) {
				let system = log.system;
				let device = log.device;
				let kwh_device = kwh_building_system_device[building][system];

				if (kwh_device[device] === undefined) {
					kwh_device[device] = { first: log.kwh };
				}
			}

			for (let i = lsLogPower.length - 1; i >= 0; i--) {
				let log = lsLogPower[i];

				let system = log.system;
				let device = log.device;
				let kwh_device = kwh_building_system_device[building][system];

				if (kwh_device[device]["last"] === undefined) {
					kwh_device[device]["last"] = log.kwh;
				}
			}
		}

		let kwhMain;
		let kwhAc;
		let kwhSolar;
		let electricityBill = 0;

		for (let [building, kwh_system_device] of Object.entries(
			kwh_building_system_device
		)) {
			let kwhTotal_system = {};
			for (let system of lsElectricalSystem) {
				for (let kwh of Object.values(kwh_system_device[system])) {
					if (kwhTotal_system[system] === undefined) {
						kwhTotal_system[system] = 0;
					}

					kwhTotal_system[system] += kwh["last"] - kwh["first"];
				}
			}

			for (let [system, kwhFirst_device] of Object.entries(kwh_system_device)) {
				let kwhLast_device = kwhLast_system_device[system];

				switch (system) {
					case "Main":
						for (let kwhFirst of Object.values(kwhFirst_device)) {
							kwhMainFirst += kwhFirst;
						}

						for (let kwhLast of Object.values(kwhLast_device)) {
							kwhMainFirst += kwhLast;
						}
						break;

					case "Air Conditioner":
				}
			}

			if (mapCostCoef_building[building] === undefined) {
				electricityBill += lsBillFirst.push(value * 4);
				lsBillLast.push(kwhMainLast_building[building] * 4);
			} else {
				lsBillFirst.push(value * mapCostCoef_building[building]);
				lsBillLast.push(
					kwhMainLast_building[building] * mapCostCoef_building[building]
				);
			}
		}

		if (kwhMainFirst_device !== undefined && kwhMainLast_device !== undefined) {
			let kwhMainFirst = 0;
			let kwhMainLast = 0;

			for (let [, value] of Object.entries(kwhMainFirst_device)) {
				kwhMainFirst += value;
			}

			for (let [, value] of Object.entries(kwhMainLast_device)) {
				kwhMainLast += value;
			}

			kwhMain = kwhMainLast - kwhMainFirst;
		} else {
			kwhMain = 0;
		}

		if (kwhAcFirst_device !== undefined && kwhAcLast_device !== undefined) {
			let kwhAcFirst = 0;
			let kwhAcLast = 0;

			for (let [, value] of Object.entries(kwhAcFirst_device)) {
				kwhAcFirst += value;
			}

			for (let [, value] of Object.entries(kwhAcLast_device)) {
				kwhAcLast += value;
			}

			kwhAc = kwhAcLast - kwhAcFirst;
		} else {
			kwhAc = 0;
		}

		if (
			kwhSolarFirst_device !== undefined &&
			kwhSolarLast_device !== undefined
		) {
			let kwhSolarFirst = 0;
			let kwhSolarLast = 0;

			for (let [, value] of Object.entries(kwhSolarFirst_device)) {
				kwhSolarFirst += value;
			}

			for (let [, value] of Object.entries(kwhSolarLast_device)) {
				kwhSolarLast += value;
			}

			kwhSolar = kwhSolarLast - kwhSolarFirst;
		} else {
			kwhSolar = 0;
		}

		if (
			kwhMainFirst_building !== undefined &&
			kwhMainLast_building !== undefined
		) {
			let lsBillFirst = [];
			let lsBillLast = [];

			for (let [key, value] of Object.entries(kwhMainFirst_building)) {
				if (mapCostCoef_building[key] === undefined) {
					lsBillFirst.push(value * 4);
					lsBillLast.push(kwhMainLast_building[key] * 4);
				} else {
					lsBillFirst.push(value * mapCostCoef_building[key]);
					lsBillLast.push(
						kwhMainLast_building[key] * mapCostCoef_building[key]
					);
				}
			}

			for (const [index, billFirst] of lsBillFirst.entries()) {
				electricityBill += lsBillLast[index] - billFirst;
			}
		}

		return { kwhMain, kwhAc, kwhSolar, electricityBill };
	}

	render() {
		let {
			currentTime,
			propsPath,
			buildingPath,
			lsBuilding,
			lsSelectedBuilding,
			lsLogPower_Building,
		} = this.state;

		let { kwhMain, kwhAc, kwhSolar, electricityBill } =
			this.calculateKwhMainAcSolarElectricityBill();

		electricityBill = kwhMain * 4;

		let target = 600000;
		let solarSavings = 10000;

		// let lsLogPower_Building = [
		// 	{
		// 		building: "Navamin",
		// 		data: [
		// 			{ log_timestamp: "2021-06-08T00:00:00Z", ac: 18, others: 12 },
		// 			{ log_timestamp: "2021-06-08T00:15:00Z", ac: 13, others: 11 },
		// 			{ log_timestamp: "2021-06-08T00:30:00Z", ac: 14, others: 14 },
		// 			{ log_timestamp: "2021-06-08T00:45:00Z", ac: 12, others: 15 },
		// 			{ log_timestamp: "2021-06-08T01:00:00Z", ac: 18, others: 14 },
		// 			{ log_timestamp: "2021-06-08T01:15:00Z", ac: 19, others: 13 },
		// 			{ log_timestamp: "2021-06-08T01:30:00Z", ac: 15, others: 12 },
		// 			{ log_timestamp: "2021-06-08T01:45:00Z", ac: 16, others: 11 },
		// 			{ log_timestamp: "2021-06-08T02:00:00Z", ac: 17, others: 12 },
		// 			{ log_timestamp: "2021-06-08T02:15:00Z", ac: 11, others: 10 },
		// 		],
		// 	},
		// 	{
		// 		building: "Auditorium",
		// 		data: [
		// 			{ log_timestamp: "2021-06-08T00:00:00Z", ac: 16, others: 1 },
		// 			{ log_timestamp: "2021-06-08T00:15:00Z", ac: 14, others: 3 },
		// 			{ log_timestamp: "2021-06-08T00:30:00Z", ac: 5, others: 2 },
		// 			{ log_timestamp: "2021-06-08T00:45:00Z", ac: 8, others: 6 },
		// 			{ log_timestamp: "2021-06-08T01:00:00Z", ac: 9, others: 7 },
		// 			{ log_timestamp: "2021-06-08T01:15:00Z", ac: 3, others: 9 },
		// 			{ log_timestamp: "2021-06-08T01:30:00Z", ac: 4, others: 5 },
		// 			{ log_timestamp: "2021-06-08T01:45:00Z", ac: 7, others: 3 },
		// 			{ log_timestamp: "2021-06-08T02:00:00Z", ac: 11, others: 1 },
		// 			{ log_timestamp: "2021-06-08T02:15:00Z", ac: 19, others: 5 },
		// 		],
		// 	},
		// ];

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
									<span style={{ color: "#757272", fontWeight: "500" }}>
										MEA
									</span>
									<span className="dot-orange" />
									<span style={{ color: "#757272", fontWeight: "500" }}>
										Solar
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
									<span style={{ color: "#757272", fontWeight: "500" }}>
										Air Conditioner
									</span>
									<span className="dot-red" />
									<span style={{ color: "#757272", fontWeight: "500" }}>
										Others
									</span>
								</Row>

								<Row className="row-pie-charts">
									<Col sm="6">
										<PieChartEnergySource mea={kwhMain} solar={kwhSolar} />
									</Col>
									<Col sm="6">
										<PieChartElectricalSystem
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
