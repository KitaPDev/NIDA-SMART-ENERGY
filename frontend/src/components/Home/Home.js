import React from "react";
import "./Home.css";
import { Container, Row, Col, Progress } from "reactstrap";
import PieChartEnergySource from "./PieChartEnergySource/PieChartEnergySource";
import PieChartSystem from "./PieChartSystem/PieChartSystem";
import LineChart_BuildingPowerConsumption from "./LineChart_BuildingPowerConsumption/LineChart_BuildingPowerConsumption";
import BarChart_SystemPowerConsumption from "./BarChart_SystemPowerConsumption/BarChart_SystemPowerConsumption";
import http from "../../utils/http";
import {
	subjectPowerMeterData,
	subjectSolarData,
	apiService,
} from "../../apiService";
import colorConverter from "../../utils/colorConverter";
import { IoMdPeople } from "react-icons/io";

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
			bill_building: {},
			targetBill_building: {},
			kwhMonth_building: {},
			kwhSolar: 0,
			kwhSolarMonth: 0,
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
			isDisplayBill: false,
			visitors: 0,
		};

		this.numberWithCommas = this.numberWithCommas.bind(this);
		this.getAllSystem = this.getAllSystem.bind(this);
		this.getAllTargetByMonthYear = this.getAllTargetByMonthYear.bind(this);
		this.getAllBuilding = this.getAllBuilding.bind(this);
		this.onClickBuilding = this.onClickBuilding.bind(this);
		this.getPowerUsedCurrentMonthBuilding =
			this.getPowerUsedCurrentMonthBuilding.bind(this);
		this.getSolarCurrentMonth = this.getSolarCurrentMonth.bind(this);
		this.toggleDisplayBill = this.toggleDisplayBill.bind(this);
	}

	numberWithCommas(x) {
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	async componentDidMount() {
		await this.getAllSystem();
		await this.getAllTargetByMonthYear();
		await this.getPowerUsedCurrentMonthBuilding();
		await this.getAllBuilding();
		await this.getSolarCurrentMonth();

		let today = new Date();
		let dateStart = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate(),
			0,
			0,
			0
		);
		let dateEnd = new Date();

		apiService.updatePowerMeterData(dateStart, dateEnd);
		apiService.updateSolarData(dateStart, dateEnd);

		subscriberPowerMeterData = subjectPowerMeterData.subscribe((dataPower) => {
			let { costCoef_building } = this.state;
			let kwh_system_building = {};
			let lsKw_system_building = {};
			let bill_building = {};

			if (!dataPower) return;

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

				kwh_system_building[building][system] += kwh;
			}

			for (let data of dataPower) {
				let building = data.building;
				let device = data.device;
				let kw = Math.round((data.kw * 100) / 100);
				let kwh = Math.round((data.kwh * 100) / 100);
				let system = data.system;

				if (!lsDeviceFirst.find((d) => d === device))
					lsDeviceFirst.push(device);
				else break;

				kwh_system_building[building][system] -= kwh;
			}

			for (let [building, kwh_system] of Object.entries(kwh_system_building)) {
				let costCoef = 4;
				if (costCoef_building[building] !== undefined) {
					costCoef = costCoef_building[building];
				}

				if (bill_building[building]) bill_building[building] = 0;

				for (let kwh of Object.values(kwh_system)) {
					if (kwh > 0) bill_building[building] = kwh * costCoef;
				}
			}

			this.setState({
				kwh_system_building: kwh_system_building,
				lsKw_system_building: lsKw_system_building,
				bill_building: bill_building,
			});
		});

		subscriberSolarData = subjectSolarData.subscribe((dataSolar) => {
			if (!dataSolar) return;
			if (dataSolar.length === 0) return;

			let kwhSolar = dataSolar[dataSolar.length - 1].kwh - dataSolar[0].kwh;

			this.setState({
				kwhSolar: kwhSolar,
			});
		});

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

		this.intervalApi = setInterval(() => {
			apiService.updatePowerMeterData();
			apiService.updateSolarData();
		}, 300000);
	}

	componentWillUnmount() {
		if (subscriberPowerMeterData) subscriberPowerMeterData.unsubscribe();
		if (subscriberSolarData) subscriberSolarData.unsubscribe();
		clearInterval(this.intervalTime);
		clearInterval(this.intervalApi);
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

	async getAllTargetByMonthYear() {
		try {
			let today = new Date();
			let payload = {
				month: today.getMonth() + 1,
				year: today.getFullYear(),
			};

			let resp = await http.post("/target/monthyear", payload);
			let lsTarget = resp.data;

			let costCoef_building = {};
			let targetBill_building = {};
			for (let target of lsTarget) {
				let building = target.building;
				let coef = target.coefficient_electricity_cost;
				let bill = target.electricity_bill;

				costCoef_building[building] = coef;
				targetBill_building[building] = bill;
			}

			this.setState({
				costCoef_building: costCoef_building,
				targetBill_building: targetBill_building,
			});
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

	async getPowerUsedCurrentMonthBuilding() {
		try {
			let month = new Date().getMonth();

			let payload = {
				month: month,
			};

			let resp = await http.post("/api/power/month", payload);

			this.setState({ kwhMonth_building: resp.data });
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async getSolarCurrentMonth() {
		try {
			let month = new Date().getMonth();

			let payload = {
				month: month,
			};

			let resp = await http.post("/api/solar/month", payload);

			this.setState({ kwhSolarMonth: resp.data.kwhSolar });
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

	toggleDisplayBill() {
		this.setState((prevState) => ({
			isDisplayBill: !prevState.isDisplayBill,
		}));
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
			kwhSolarMonth,
			bill_building,
			targetBill_building,
			kwhMonth_building,
			costCoef_building,
			isDisplayBill,
			visitors,
		} = this.state;

		let kwhMainTotal = 0;
		let kwhAcTotal = 0;

		if (lsSelectedBuilding.length === 0) {
			lsSelectedBuilding = lsBuilding.map((building) => building.label);
		}

		for (let building of lsSelectedBuilding) {
			if (kwh_system_building[building]) {
				if (kwh_system_building[building]["Main"])
					kwhMainTotal += kwh_system_building[building]["Main"];

				if (kwh_system_building[building]["Air Conditioner"])
					kwhAcTotal += kwh_system_building[building]["Air Conditioner"];
			}
		}

		let billMonthTotal = 0;
		for (let [building, kwhMonth] of Object.entries(kwhMonth_building)) {
			if (!lsSelectedBuilding.includes(building)) continue;

			let coef = 4;
			if (costCoef_building[building]) coef = costCoef_building[building];

			let bill = kwhMonth * coef;

			billMonthTotal += bill;
		}

		let target;
		for (let [building, targetBill] of Object.entries(targetBill_building)) {
			if (!lsSelectedBuilding.includes(building)) continue;
			if (!target) target = 0;
			target += targetBill;
		}

		return (
			<div>
				<Container id="container-home" fluid>
					<Row>
						{/* ******************************** LEFT COLUMN ******************************** */}
						<Col sm="5">
							<div id="left-top-pane-group">
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
											{this.numberWithCommas(Math.round(kwhMainTotal))}
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
											<PieChartEnergySource
												mea={kwhMainTotal}
												solar={kwhSolar}
											/>
										</Col>
										<Col sm="6">
											<PieChartSystem
												ac={kwhAcTotal}
												others={kwhMainTotal - kwhAcTotal}
												building={
													lsSelectedBuilding.length === 1
														? lsSelectedBuilding[0]
														: ""
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
													parseFloat(billMonthTotal).toFixed(2)
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
											<span>
												฿ -{" "}
												{this.numberWithCommas(
													parseFloat(kwhSolarMonth * 4).toFixed(2)
												)}
											</span>
										</Col>
										<Col sm="6" style={{ color: "#899CA2" }}>
											<span>
												{target
													? parseFloat((billMonthTotal / target) * 100).toFixed(
															2
													  )
													: "N/A"}
												%
											</span>
										</Col>
										<Col sm="3">
											<span>
												฿ {target ? this.numberWithCommas(target) : "N/A"}
											</span>
										</Col>
									</Row>
									<Row className="row-progress" style={{ paddingBottom: 0 }}>
										<Col sm="3" style={{ paddingRight: 0 }}>
											<Progress
												color="warning"
												value={
													((kwhSolar * 4) / (target === 0 ? 1 : target)) * 100
												}
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
												color={billMonthTotal > target ? "danger" : "success"}
												value={
													(billMonthTotal / (target === 0 ? 1 : target)) * 100
												}
												style={{
													backgroundColor: "white",
													border: "solid 1px",
													borderRadius: "0",
													height: "20px",
													fontWeight: "bold",
												}}
											>
												฿{" "}
												{this.numberWithCommas(
													parseFloat(billMonthTotal).toFixed(2)
												)}
											</Progress>
										</Col>
										<Col sm="1"></Col>
									</Row>
								</div>
							</div>

							<div id="left-bottom-pane-group">
								{/* ******************************** BUILDING POWER CONSUMPTION PANE ******************************** */}
								<div className="building-power-consumption-pane">
									<LineChart_BuildingPowerConsumption
										lsSelectedBuilding={lsSelectedBuilding}
										lsKw_system_building={lsKw_system_building}
										lsBuilding={lsBuilding}
									/>
								</div>
								{/* ******************************** ELECTRICAL SYSTEM POWER CONSUMPTION PANE ******************************** */}
								<div className="electrical-system-power-consumption-pane">
									<BarChart_SystemPowerConsumption
										lsSelectedBuilding={lsSelectedBuilding}
										lsKw_system_building={lsKw_system_building}
										lsBuilding={lsBuilding}
									/>
								</div>
							</div>
						</Col>

						{/* ******************************** RIGHT COLUMN ******************************** */}
						<Col sm="7">
							<Row>
								<Col sm="6">
									<input
										type="checkbox"
										id="chk-bill"
										checked={isDisplayBill}
										onChange={this.toggleDisplayBill}
									/>
									<label id="label-bill">Electricity Bill</label>
								</Col>
								<Col sm="6" style={{ textAlign: "right" }}>
									<span id="num-vis">{visitors}</span>
									<IoMdPeople size={"2rem"} />
								</Col>
							</Row>
							<Row>
								<Col sm="2"></Col>
								<Col sm="2"></Col>
								<Col sm="2"></Col>
								<Col sm="2"></Col>
								<Col sm="2"></Col>
								<Col sm="2"></Col>
							</Row>
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
										key={building.label}
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
										// style={{ }}
										onClick={() => this.onClickBuilding(building.label)}
									/>
								))}
							</div>

							<Row>
								<Col sm="2"></Col>
								<Col sm="2"></Col>
								<Col sm="2"></Col>
								<Col sm="2"></Col>
								<Col sm="2"></Col>
							</Row>

							{/* ******************************* Map Footer ******************************** */}
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
