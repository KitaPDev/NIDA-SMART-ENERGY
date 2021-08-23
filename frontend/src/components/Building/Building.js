import React from "react";

// Charts and Diagrams
import BarChartSystemPowerConsumption from "./BarChartSystemPowerConsumption/BarChartSystemPowerConsumption";
import PieChartSystem from "./PieChartSystem/PieChartSystem";
import MixedChartBillCompare from "./MixedChartBillCompare/MixedChartBillCompare";

// Styling and Graphics
import "./Building.css";
import { MdPeople } from "react-icons/md";
import { RiFileExcel2Fill } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import {
	Container,
	Row,
	Col,
	Label,
	Input,
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	Button,
	Form,
	FormGroup,
	Progress,
} from "reactstrap";
import { ReactSVG } from "react-svg";

// Utils
import http from "../../utils/http";
import dateFormatter from "../../utils/dateFormatter";
import numberFormatter from "../../utils/numberFormatter";
import colorConverter from "../../utils/colorConverter";
import csv from "../../utils/csv";

class Building extends React.Component {
	constructor(props) {
		super(props);

		let dateFrom = new Date(new Date().setHours(0, 0, 0, 0));
		let dateTo = new Date();

		this.state = {
			lsBuilding: [],
			lsTarget: [],
			dateFrom: dateFrom,
			dateTo: dateTo,
			displayDateFrom: dateFrom,
			displayDateTo: dateTo,
			isSystemDropdownOpen: false,
			system: "Overall",
			currentBuildingLabel: "",
			kwh_system_floor: {},
			kwh_month: {},
			lsLogKw_system: {},
			compareTo: "Target",
			buildingPath: window.location.origin + "/building/", // For Building Images
		};

		let currentBuildingLabel = this.props.location.building;

		currentBuildingLabel === undefined
			? (this.state.currentBuildingLabel = "Auditorium")
			: (this.state.currentBuildingLabel = currentBuildingLabel);

		this.updateData = this.updateData.bind(this);
		this.handleInputDateChange = this.handleInputDateChange.bind(this);
		this.toggleSystem = this.toggleSystem.bind(this);
		this.changeSystem = this.changeSystem.bind(this);
		this.getAllBuilding = this.getAllBuilding.bind(this);
		this.getData = this.getData.bind(this);
		this.getBuildingTargetRange = this.getBuildingTargetRange.bind(this);
		this.onClickBuilding = this.onClickBuilding.bind(this);
		this.onClickApply = this.onClickApply.bind(this);
		this.onClickCompareTo = this.onClickCompareTo.bind(this);
		this.exportBarChartSystemPowerConsumption =
			this.exportBarChartSystemPowerConsumption.bind(this);
	}

	async updateData() {
		await this.getData();
		await this.getBuildingTargetRange();

		let { dateFrom, dateTo } = this.state;

		this.setState({
			displayDateFrom: dateFrom,
			displayDateTo: dateTo,
		});
	}

	async componentDidMount() {
		await this.getAllBuilding();
		await this.updateData();
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

	async getData() {
		try {
			let { lsBuilding, currentBuildingLabel, dateFrom, dateTo } = this.state;

			let buildingID = lsBuilding.find(
				(bld) => bld.label === currentBuildingLabel
			).id;

			let payload = {
				building_id: buildingID,
				date_from: dateFrom,
				date_to: dateTo,
			};

			let resp = await http.post("/building/data", payload);

			let lsData = resp.data;

			let lsDeviceFirst = [];
			let lsDeviceLast = [];

			let lsLogKw_system = {};
			let kwh_system_floor = {};
			let kwh_month = {};
			for (let data of lsData.slice().reverse()) {
				let floor = data.floor;
				let device = data.device;
				let datetime = new Date(data.data_datetime);
				let kw = Math.round((data.kw * 100) / 100);
				let kwh = Math.round((data.kwh * 100) / 100);
				let system = data.system;

				if (lsLogKw_system[system] === undefined) lsLogKw_system[system] = [];

				lsLogKw_system[system].push({
					datetime: datetime,
					kw: kw,
				});

				if (!lsDeviceLast.find((d) => d === device)) {
					lsDeviceLast.push(device);
				} else continue;

				if (kwh_system_floor[floor] === undefined) {
					kwh_system_floor[floor] = {};
				}

				if (kwh_system_floor[floor][system] === undefined) {
					kwh_system_floor[floor][system] = 0;
				}

				kwh_system_floor[floor][system] += kwh;

				let month = datetime.getMonth() + 1;
				if (kwh_month[month] === undefined) kwh_month[month] = 0;
				kwh_month[month] += kwh;
			}

			for (let data of lsData) {
				let floor = data.floor;
				let device = data.device;
				let kwh = Math.round((data.kwh * 100) / 100);
				let system = data.system;

				if (!lsDeviceFirst.find((d) => d === device))
					lsDeviceFirst.push(device);
				else break;

				kwh_system_floor[floor][system] -= kwh;

				let datetime = new Date(data.data_datetime);
				let month = datetime.getMonth() + 1;
				kwh_month[month] -= kwh;
			}

			this.setState({
				kwh_system_floor: kwh_system_floor,
				kwh_month: kwh_month,
				lsLogKw_system: lsLogKw_system,
			});
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async getBuildingTargetRange() {
		try {
			let { dateFrom, dateTo, currentBuildingLabel, lsBuilding } = this.state;

			if (dateFrom.length === 0 || dateTo.length === 0) {
				alert("Please select a valid datetime range.");
				return;
			}

			let payload = {
				month_from: dateFrom.getMonth() + 1,
				year_from: dateFrom.getFullYear(),
				month_to: dateTo.getMonth() + 1,
				year_to: dateTo.getFullYear(),
				building_id: lsBuilding.find(
					(building) => building.label === currentBuildingLabel
				).id,
			};

			let resp = await http.post("/target/building", payload);

			this.setState({
				lsTarget: resp.data,
			});
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	handleInputDateChange(e) {
		this.setState({ [e.target.name]: new Date(e.target.value) });
	}

	toggleSystem() {
		this.setState((prevState) => ({
			isSystemDropdownOpen: !prevState.isSystemDropdownOpen,
		}));
	}

	changeSystem(e) {
		this.setState({
			system: e.currentTarget.textContent,
		});
	}

	onClickApply() {
		this.updateData();
	}

	onClickBuilding(buildingLabel) {
		this.setState({ currentBuildingLabel: buildingLabel }, () => {
			this.updateData();
		});
	}

	onClickCompareTo(compareTo) {
		this.setState({
			compareTo: compareTo,
		});
	}

	exportBarChartSystemPowerConsumption() {
		let { lsLogKw_system, system } = this.state;

		let lsLogKwMain = [];
		let lsLogKwAc = [];
		let lsLogKwOthers = [];

		if (lsLogKw_system["Main"]) {
			lsLogKw_system["Main"].slice().forEach(function (log) {
				if (!this[log.datetime]) {
					this[log.datetime] = { datetime: log.datetime, kw: 0 };
					lsLogKwMain.push(this[log.datetime]);
				}
				this[log.datetime].kw += log.kw;
			}, Object.create(null));
		}

		if (lsLogKw_system["Air Conditioner"]) {
			lsLogKw_system["Air Conditioner"].slice().forEach(function (log) {
				if (!this[log.datetime]) {
					this[log.datetime] = { datetime: log.datetime, kw: 0 };
					lsLogKwAc.push(this[log.datetime]);
				}
				this[log.datetime].kw += log.kw;
			}, Object.create(null));
		}

		if (system === "Others") {
			lsLogKwMain.forEach((logKwMain, idx) => {
				if (lsLogKwAc[idx]) {
					lsLogKwOthers.push({
						datetime: logKwMain.datetime,
						kw: logKwMain.kw - lsLogKwAc[idx].kw,
					});
				} else lsLogKwOthers.push(logKwMain);
			});
		}

		let rows = [[]];
		rows[0].push("Datetime", "kW");

		if (system === "Overall") {
			lsLogKwMain.forEach((logKwMain, idx) => {
				if (!rows[idx + 1]) rows[idx + 1] = [];
				rows[idx + 1].push(
					dateFormatter.yyyymmddhhmmss_noOffset(logKwMain.datetime),
					logKwMain.kw
				);
			});
		} else if (system === "Air Conditioner") {
			lsLogKwAc.forEach((logKwAc, idx) => {
				if (!rows[idx + 1]) rows[idx + 1] = [];
				rows[idx + 1].push(
					dateFormatter.yyyymmddhhmmss_noOffset(logKwAc.datetime),
					logKwAc.kw
				);
			});
		} else if (system === "Others") {
			lsLogKwOthers.forEach((logKwOthers, idx) => {
				if (!rows[idx + 1]) rows[idx + 1] = [];
				rows[idx + 1].push(
					dateFormatter.yyyymmddhhmmss_noOffset(logKwOthers.datetime),
					logKwOthers.kw
				);
			});
		}

		csv.exportFile(`Power - ${system}`, rows);
	}

	render() {
		let {
			lsBuilding,
			lsTarget,
			currentBuildingLabel,
			dateFrom,
			dateTo,
			displayDateFrom,
			displayDateTo,
			isSystemDropdownOpen,
			system,
			kwh_system_floor,
			kwh_month,
			lsLogKw_system,
			compareTo,
			buildingPath,
		} = this.state;

		// Calculate Estimated People
		let estimatedPeople = "N/A";
		for (let target of lsTarget) {
			if (estimatedPeople === "N/A") estimatedPeople = 0;
			estimatedPeople += target.amount_people;
		}

		// Calculate Bill
		let bill = 0;
		for (let [month, kwh] of Object.entries(kwh_month)) {
			let tariff = 4;

			let target = lsTarget.find((target) => target.month === month);
			if (target !== undefined) {
				if (target.tariff !== null) tariff = target.tariff;
			}

			bill += kwh * tariff;
		}

		// Check Pie Chart disabled
		let isPieChartDisabled = true;
		// Calculate Total Energy Consumption, Pie Chart data
		let kwhTotal = 0;
		let kwhAc = 0;
		let kwhOthers = 0;
		for (let [floor, kwh_system] of Object.entries(kwh_system_floor)) {
			for (let [system, kwh] of Object.entries(kwh_system)) {
				kwhTotal += kwh;

				if (system === "Main") kwhOthers += kwh;
				else if (system === "Air Conditioner") kwhAc += kwh;

				if (floor !== null && system === "Air Conditioner") {
					isPieChartDisabled = false;
				}
			}
		}
		kwhOthers -= kwhAc;

		// Calculate Electricity Use per Capita
		let kwhPerCapita = 0;
		if (estimatedPeople !== "N/A")
			kwhPerCapita = parseFloat(kwhTotal / estimatedPeople).toFixed(2);

		let color = lsBuilding.find((bld) => bld.label === currentBuildingLabel)
			? lsBuilding.find((bld) => bld.label === currentBuildingLabel).color_code
			: "black";

		let floor = 1; // Some buildings have basement levels
		if (currentBuildingLabel === "Navamin") floor = -2;

		return (
			<div id="container-building">
				<Container id="container-building-top" fluid>
					<Row id="row-building-top">
						{/* ******************************** Left Pane ******************************** */}
						<Col id="col-building-list" sm={2}>
							<div class="building-list-pane">
								<p class="heading-1">Building</p>
								{lsBuilding.map((bld) => (
									<div>
										<Row
											className="row-building"
											style={{
												opacity: bld.label === currentBuildingLabel ? 1 : 0.5,
											}}
											onClick={() => this.onClickBuilding(bld.label)}
										>
											<Col sm={2} className="col-square-building">
												<div
													className="square-building"
													style={{
														backgroundColor: bld.color_code,
													}}
												></div>
											</Col>
											<Col sm={10}>{bld.label}</Col>
										</Row>
									</div>
								))}
							</div>
						</Col>

						{/* ******************************** Main Section ******************************** */}
						<Col sm={10}>
							<Row style={{ height: "100%" }}>
								{/* ******************************** Left ******************************** */}
								<Col sm={4} style={{ paddingRight: "2rem" }}>
									<Row
										className="row-title"
										style={{
											color: color,
										}}
									>
										{currentBuildingLabel}
									</Row>
									<Row
										className="row-heading"
										style={{
											color: color,
										}}
									>
										<p>
											Estimated{" "}
											<span style={{ fontSize: "150%", fontWeight: "bold" }}>
												{numberFormatter.withCommas(estimatedPeople)}
											</span>{" "}
											people{" "}
											<span>
												<MdPeople size="1.5em" style={{ margin: "auto" }} />
											</span>
										</p>
									</Row>
									<Row className="row-date">
										{dateFormatter.ddmmmyyyyhhmm_noOffset(displayDateFrom) +
											" - " +
											dateFormatter.ddmmmyyyyhhmm_noOffset(displayDateTo)}
									</Row>
									<Row id="row-tec">
										<Col sm={5} className="col-label-1">
											Total Energy Consumption
										</Col>
										<Col sm={5} className="col-data-1" style={{ color: color }}>
											{numberFormatter.withCommas(kwhTotal)}
										</Col>
										<Col sm={2} className="col-unit-1" style={{ color: color }}>
											kWh
										</Col>
									</Row>

									<Row id="row-eb">
										<Col sm={5} className="col-label-1">
											Electricity Bill
										</Col>
										<Col sm={5} className="col-data-2" style={{ color: color }}>
											{numberFormatter.withCommas(bill)}
										</Col>
										<Col sm={2} className="col-unit-1" style={{ color: color }}>
											THB
										</Col>
									</Row>

									<Row id="row-pie">
										<Col sm={3} className="col-label-2">
											Used in
										</Col>
										<Col sm={4} style={{ paddingRight: 0, margin: "auto" }}>
											<div>
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
											</div>
											<div>
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
											</div>
										</Col>
										<Col sm={5} id="col-pie" style={{ color: color }}>
											<PieChartSystem
												disabled={isPieChartDisabled}
												ac={kwhAc}
												others={kwhOthers}
												building={currentBuildingLabel}
											/>
										</Col>
									</Row>

									<Row id="row-capita">
										<Col sm={7} className="col-label-2">
											Energy Use per Capita <FaUser size={15} id="icon-user" />
										</Col>
										<Col sm={3} className="col-data-2" style={{ color: color }}>
											{kwhPerCapita}
										</Col>
										<Col sm={2} className="col-unit-1" style={{ color: color }}>
											kWh
										</Col>
									</Row>
								</Col>

								{/* ******************************** Right ******************************** */}
								<Col sm={8}>
									<Row className="row-form">
										<Label for="dateFrom" sm={1} className="label-datepicker">
											From
										</Label>
										<Col sm={4} className="col-datepicker">
											<Input
												className="datepicker"
												type="datetime-local"
												name="dateFrom"
												id="dateFrom"
												placeholder="datetime placeholder"
												value={dateFormatter.toDateTimeString(dateFrom)}
												onChange={this.handleInputDateChange}
											/>
										</Col>
										<Label for="dateTo" sm={1} className="label-datepicker">
											To
										</Label>
										<Col sm={4} className="col-datepicker">
											<Input
												className="datepicker"
												type="datetime-local"
												name="dateTo"
												id="dateTo"
												placeholder="datetime placeholder"
												value={dateFormatter.toDateTimeString(dateTo)}
												onChange={this.handleInputDateChange}
											/>
										</Col>
										<Col sm={2} style={{ textAlign: "center" }}>
											<Button id="btn-apply-bld" onClick={this.onClickApply}>
												Apply
											</Button>
										</Col>
									</Row>

									{/* ******************************** Right Part ******************************** */}
									<Row id="row-graph-power">
										<Row style={{ padding: "0.5rem" }}>
											<Col sm={9}>
												<span
													style={{
														fontWeight: 600,
														fontSize: "125%",
													}}
												>
													Power (kW)
												</span>
											</Col>
											<Col sm={2} style={{ textAlign: "right" }}>
												<Dropdown
													isOpen={isSystemDropdownOpen}
													toggle={this.toggleSystem}
												>
													<DropdownToggle color="transparent" caret>
														{system}
													</DropdownToggle>
													<DropdownMenu>
														<DropdownItem onClick={this.changeSystem}>
															Overall
														</DropdownItem>
														<DropdownItem onClick={this.changeSystem}>
															Air Conditioner
														</DropdownItem>
														<DropdownItem onClick={this.changeSystem}>
															Others
														</DropdownItem>
													</DropdownMenu>
												</Dropdown>
											</Col>
											<Col
												sm={1}
												style={{ margin: "auto", textAlign: "right" }}
											>
												<RiFileExcel2Fill
													className="icon-excel"
													size={25}
													onClick={this.exportBarChartSystemPowerConsumption}
												/>
											</Col>
										</Row>
										<Row>
											<BarChartSystemPowerConsumption
												system={system}
												color={color}
												lsLogKw_system={lsLogKw_system}
											/>
										</Row>
									</Row>
									<Row id="row-graph-compare">
										<Row>
											<Col sm={3} id="col-compare">
												<Form id="form-compare">
													<legend>Compare to</legend>
													<FormGroup check>
														<Label check>
															<Input
																id="radio-target"
																type="radio"
																name="compareTo"
																checked={compareTo === "Target"}
																onChange={() => this.onClickCompareTo("Target")}
															/>
															Target
														</Label>
													</FormGroup>
													<FormGroup check>
														<Label check>
															<Input
																id="radio-average"
																type="radio"
																name="compareTo"
																checked={compareTo === "Average"}
																onChange={() =>
																	this.onClickCompareTo("Average")
																}
															/>
															Average
														</Label>
													</FormGroup>
													<FormGroup check>
														<Label check>
															<Input
																id="radio-lastyear"
																type="radio"
																name="compareTo"
																checked={compareTo === "Last Year"}
																onChange={() =>
																	this.onClickCompareTo("Last Year")
																}
															/>
															Last Year
														</Label>
													</FormGroup>
												</Form>
											</Col>
											<MixedChartBillCompare
												building={lsBuilding.find(
													(bld) => bld.label === currentBuildingLabel
												)}
												compareTo={compareTo}
											/>
										</Row>
									</Row>
								</Col>
							</Row>
						</Col>
					</Row>
				</Container>

				{/* ****************************** Floor Plan ******************************** */}
				<Container id="container-floor-plan" fluid>
					<div id="floor-plan-row-top">
						<span id="floor-plan-title">Floor Plan</span>
						<span id="wrapper-legend">
							<span className="legend-desc">
								<div>Color Legend</div>
								<div>#From Total Energy</div>
							</span>
							<span className="legend-graphics">
								<div className="legend-dots">
									<span className="legend-dot-1"></span>
									<span className="legend-dot-3"></span>
								</div>
								<div className="legend gradient"></div>
							</span>
						</span>
					</div>
					{lsBuilding.length > 0 ? (
						<div id="floors">
							{new Array(
								lsBuilding.find(
									(bld) => bld.label === currentBuildingLabel
								).floors
							)
								.fill(0)
								.map((_, idx) => {
									if (idx > 0) floor++; // Skip first round
									if (floor === 0) floor++; // No Floor 0

									// Check Progress Bar disabled
									let isProgressBarDisabled = false;
									// Every floor must contain both Main and Air Conditioner kWh values
									if (kwh_system_floor[floor] === undefined) {
										isProgressBarDisabled = true;
									} else if (
										!(
											Object.keys(kwh_system_floor[floor]).includes("Main") &&
											Object.keys(kwh_system_floor[floor]).includes(
												"Air Conditioner"
											)
										)
									) {
										isProgressBarDisabled = true;
									}

									let kwhFloorMain = 0;
									let kwhFloorAc = 0;
									if (kwh_system_floor[floor]) {
										if (kwh_system_floor[floor]["Main"]) {
											kwhFloorMain = kwh_system_floor[floor]["Main"];
										}
										if (kwh_system_floor[floor]["Air Conditioner"]) {
											kwhFloorAc = kwh_system_floor[floor]["Air Conditioner"];
										}
									}

									let kwhFloorOthers = kwhFloorMain - kwhFloorAc;

									return (
										<div className="floor">
											<style>
												{`#img-floor-${floor} path[class^="st"], #img-floor-${floor} polygon[class^="st"], #img-floor-${floor} rect[class^="st"] {
														stroke: transparent;
														fill: #${colorConverter.pickHex(
															"d10909",
															"d1dbde",
															parseFloat(kwhFloorMain / kwhTotal).toFixed(2)
														)};
													}
													#floor-title-${floor}{
														background: #${colorConverter.pickHex(
															"d10909",
															"d1dbde",
															parseFloat(kwhFloorMain / kwhTotal).toFixed(2)
														)};
													}
													`}
											</style>
											<ReactSVG
												afterInjection={(error) => {
													if (error) {
														console.log(error);
														return;
													}
												}}
												id={`img-floor-${floor}`}
												className={"img-floor"}
												src={
													buildingPath +
													lsBuilding.find(
														(bld) => bld.label === currentBuildingLabel
													).label +
													"/" +
													`${floor}` +
													".svg"
												}
												wrapper="span"
											/>

											<span className="data-floor">
												<div className="row-floor">
													<span
														id={"floor-title-" + floor}
														className="floor-title"
													>
														FLOOR{" "}
														{floor < 0
															? floor.toString().slice().replace("-", "B")
															: floor === 13
															? currentBuildingLabel === "Navamin"
																? "12A"
																: floor
															: floor}
													</span>
													<span className="floor-percent">
														{kwh_system_floor[floor]
															? kwh_system_floor[floor]["Main"]
																? parseFloat(kwhFloorMain / kwhTotal).toFixed(2)
																: "-"
															: "-"}
														%
													</span>
												</div>

												<div
													className="row-floor"
													style={{ textAlign: "center" }}
												>
													<span className="floor-kwh-total">
														{kwh_system_floor[floor]
															? kwh_system_floor[floor]["Main"]
																? numberFormatter.withCommas(
																		parseFloat(kwhFloorMain).toFixed(2)
																  )
																: "-"
															: "-"}{" "}
														kWh
													</span>
												</div>

												<div className="row-floor-1">
													<Progress multi>
														{isProgressBarDisabled ? (
															<Progress bar value={0}></Progress>
														) : (
															<>
																<Progress
																	bar
																	color="#3c67be"
																	value={(kwhFloorAc / kwhFloorMain) * 100}
																></Progress>
																<Progress
																	bar
																	color="#be4114"
																	value={(kwhFloorOthers / kwhFloorMain) * 100}
																></Progress>
															</>
														)}
													</Progress>
													<div className="prg-legend">
														<span>Air Con.</span>
														<span style={{ float: "right" }}>Others</span>
													</div>
												</div>

												<div className="row-floor-1">
													<div>
														<div>
															<span>
																{isProgressBarDisabled
																	? "-"
																	: (kwhFloorAc / kwhFloorMain) * 100}
																%
															</span>
															<span style={{ float: "right" }}>
																{isProgressBarDisabled
																	? "-"
																	: (kwhFloorOthers / kwhFloorMain) * 100}
																%
															</span>
														</div>
													</div>
												</div>

												<div className="row-floor-1">
													<div>
														<div>
															<span className="floor-kwh">
																{isProgressBarDisabled ? "-" : kwhFloorAc} kWh
															</span>
															<span
																className="floor-kwh"
																style={{ float: "right" }}
															>
																{isProgressBarDisabled ? "-" : kwhFloorOthers}{" "}
																kWh
															</span>
														</div>
													</div>
												</div>
											</span>
										</div>
									);
								})}
						</div>
					) : (
						""
					)}
				</Container>
			</div>
		);
	}
}

export default Building;
