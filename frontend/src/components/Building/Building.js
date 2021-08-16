import React from "react";

// Charts and Diagrams
import BarChart_SystemPowerConsumption from "./BarChart_SystemPowerConsumption/BarChart_SystemPowerConsumption";
import PieChartSystem from "./PieChartSystem/PieChartSystem";

// Styling and Icons
import "./Building.css";
import { Container, Row, Col } from "reactstrap";
import { MdPeople } from "react-icons/md";
import { RiFileExcel2Fill } from "react-icons/ri";
import { FaUser } from "react-icons/fa";
import {
	Label,
	Input,
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
	Button,
} from "reactstrap";

// Utils
import http from "../../utils/http";
import dateFormatter from "../../utils/dateFormatter";
import numberFormatter from "../../utils/numberFormatter";

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
		this.onClickApply = this.onClickApply.bind(this);
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

			let lsKw_system_floor = {};
			let kwh_system_floor = {};
			for (let data of lsData.slice().reverse()) {
				let floor = data.floor;
				let device = data.device;
				let datetime = data.data_datetime;
				let kw = Math.round((data.kw * 100) / 100);
				let kwh = Math.round((data.kwh * 100) / 100);
				let system = data.system;

				if (lsKw_system_floor[floor] === undefined) {
					lsKw_system_floor[floor] = {};
				}

				if (lsKw_system_floor[floor][system] === undefined) {
					lsKw_system_floor[floor][system] = [];
				}

				lsKw_system_floor[floor][system].push({
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
					kwh_system_floor[floor][system] = [];
				}

				kwh_system_floor[floor][system] += kwh;
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
			}

			this.setState({
				kwh_system_floor: kwh_system_floor,
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
		} = this.state;

		let estimatedPeople = "N/A";
		for (let target of lsTarget) {
			if (estimatedPeople === "N/A") estimatedPeople = 0;
			estimatedPeople += target.amount_people;

			let tariff = 4;
			if (target.tariff !== null) tariff = target.tariff;
		}

		let kwhTotal = 0;
		let kwhPerCapita = 0;
		let kwhAc = 0;
		let kwhOthers = 0;
		for (let [floor, kwh_system] of Object.entries(kwh_system_floor)) {
			for (let [system, kwh] of Object.entries(kwh_system)) {
				kwhTotal += kwh;

				if (system === "Main") kwhOthers += kwh;
				else if (system === "Air Conditioner") kwhAc += kwh;
			}
		}
		kwhOthers -= kwhAc;

		let bill = 0;

		if (estimatedPeople !== "N/A")
			kwhPerCapita = parseFloat(kwhTotal / estimatedPeople).toFixed(2);

		let lsLogPower_Building = [
			{
				building: "Navamin",
				data: [
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
			},
			{
				building: "Auditorium",
				data: [
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
			},
		];

		let lsLogPower = {};

		for (let log of lsLogPower_Building) {
			if (log.building === currentBuildingLabel) {
				lsLogPower = log;
				break;
			}
		}

		let color = lsBuilding.find((bld) => bld.label === currentBuildingLabel)
			? lsBuilding.find((bld) => bld.label === currentBuildingLabel).color_code
			: "black";

		return (
			<div>
				<Container style={{ padding: "1rem" }} fluid>
					<Row>
						{/* ******************************** Left Pane ******************************** */}
						<Col sm={2}>
							<div className="building-list-pane">
								<p id="heading-1">Building</p>
								{lsBuilding.map((bld) => (
									<div>
										<Row
											className="row-building"
											style={{
												opacity: bld.label === currentBuildingLabel ? 1 : 0.5,
											}}
											onClick={() =>
												this.setState({ currentBuildingLabel: bld.label })
											}
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
						<Col sm={10} style={{ paddingLeft: "1rem" }}>
							<Row>
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
									<Row id="row-date">
										{dateFormatter.ddmmmyyyy(displayDateFrom) +
											" - " +
											dateFormatter.ddmmmyyyy(displayDateTo)}
									</Row>
									<Row id="row-tec">
										<Col sm={5} className="col-label-1">
											Total Energy Consumption
										</Col>
										<Col sm={5} className="col-data-1" style={{ color: color }}>
											{kwhTotal}
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
											{bill}
										</Col>
										<Col sm={2} className="col-unit-1" style={{ color: color }}>
											THB
										</Col>
									</Row>

									<Row id="row-pie">
										<Col sm={5} className="col-label-2">
											Used in
										</Col>
										<Col sm={7} id="col-pie" style={{ color: color }}>
											<PieChartSystem
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
								<Col sm={8} style={{ paddingRight: "1rem" }}>
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
										<Col sm={2}>
											<Button id="btn-apply-bld" onClick={this.onClickApply}>
												Apply
											</Button>
										</Col>
									</Row>

									{/* ******************************** Right Part ******************************** */}
									<Row className="row-graph-power">
										<Row style={{ padding: "0.5rem", margin: "auto" }}>
											<Col sm={9} style={{ margin: "auto" }}>
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
															A/C
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
													style={{
														width: "60%",
														height: "auto",
													}}
												/>
											</Col>
										</Row>
										<Row>
											<BarChart_SystemPowerConsumption
												lsSelectedBuilding={lsSelectedBuilding}
												lsKw_system_building={lsKw_system_building}
												lsBuilding={lsBuilding}
											/>
										</Row>
									</Row>
								</Col>
							</Row>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default Building;
