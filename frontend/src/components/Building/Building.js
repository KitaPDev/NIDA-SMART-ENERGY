import React from "react";

// Charts and Diagrams
import BarChartSystemPowerConsumption from "./BarChartSystemPowerConsumption/BarChartSystemPowerConsumption";

// Styling and Icons
import "./Building.css";
import { Container, Row, Col } from "reactstrap";
import { MdPeople } from "react-icons/md";
import { RiFileExcel2Fill } from "react-icons/ri";
import {
	Form,
	FormGroup,
	Label,
	Input,
	Dropdown,
	DropdownToggle,
	DropdownMenu,
	DropdownItem,
} from "reactstrap";

// Utils
import http from "../../utils/http";
import dateFormatter from "../../utils/dateFormatter";
import numberFormatter from "../../utils/numberFormatter";

class Building extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			lsBuilding: [],
			lsTarget: [],
			dateFrom: new Date(new Date().setHours(0, 0, 0, 0)),
			dateTo: new Date(),
			isSystemDropdownOpen: false,
			system: "Overall",
			currentBuildingLabel: "",
			kwh_system_floor: {},
		};

		let currentBuildingLabel = this.props.location.building;

		currentBuildingLabel === undefined
			? (this.state.currentBuildingLabel = "Auditorium")
			: (this.state.currentBuildingLabel = currentBuildingLabel);

		this.handleChangeDateFrom = this.handleChangeDateFrom.bind(this);
		this.handleChangeDateTo = this.handleChangeDateTo.bind(this);
		this.toggleSystem = this.toggleSystem.bind(this);
		this.changeSystem = this.changeSystem.bind(this);
		this.getAllBuilding = this.getAllBuilding.bind(this);
		this.getTarget_MonthYear = this.getTarget_MonthYear.bind(this);
		this.getData = this.getData.bind(this);
	}

	async componentDidMount() {
		await this.getAllBuilding();
		await this.getTarget_MonthYear();
		await this.getData();
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

	async getTarget_MonthYear() {
		try {
			let today = new Date();
			let payload = {
				month: today.getMonth() + 1,
				year: today.getFullYear(),
			};

			let resp = await http.post("/target/monthyear", payload);

			this.setState({
				lsTarget: resp.data,
			});
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

			console.log(resp.data);

			let lsData = resp.data;

			let lsDeviceFirst = [];
			let lsDeviceLast = [];

			let lsKwh_system_floor = {};
			let kwh_system_floor = {};
			for (let data of lsData) {
				let floor = data.floor;
				let device = data.device;
				let datetime = data.data_datetime;
				let kw = Math.round((data.kw * 100) / 100);
				let kwh = Math.round((data.kwh * 100) / 100);
				let system = data.system;

				if (lsKwh_system_floor[floor] === undefined) {
					lsKwh_system_floor[floor] = {};
				}

				if (lsKwh_system_floor[floor][system] === undefined) {
					lsKwh_system_floor[floor][system] = [];
				}

				lsKwh_system_floor[floor][system].push({
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
			}
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	handleChangeDateFrom(event) {
		this.setState({
			dateFrom: event.target.value,
		});
	}

	handleChangeDateTo(event) {
		this.setState({ dateTo: event.target.value });
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

	render() {
		let {
			lsBuilding,
			lsTarget,
			currentBuildingLabel,
			dateFrom,
			dateTo,
			isSystemDropdownOpen,
			system,
		} = this.state;

		let estimatedPeople = "N/A";
		let target = lsTarget.find((t) => t.building === currentBuildingLabel);
		if (target) estimatedPeople = target.amount_people;

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
								<Col sm={5}>
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
										{dateFormatter.ddmmmyyyy(dateFrom) +
											" - " +
											dateFormatter.ddmmmyyyy(dateTo)}
									</Row>
									<Row>
										<Col sm={5} className="col-label-1">
											Total Energy Consumption
										</Col>
										<Col sm={7} style={{ color: color }}></Col>
									</Row>
								</Col>

								{/* ******************************** Right ******************************** */}
								<Col sm={7} style={{ paddingRight: "1rem" }}>
									<Row className="row-form">
										<Form>
											<FormGroup row>
												<Col sm={1} />
												<Label
													for="dateFrom"
													sm={1}
													className="label-datepicker"
												>
													From
												</Label>
												<Col sm={4} className="col-datepicker">
													<Input
														className="datepicker"
														type="datetime-local"
														name="datetime"
														id="dateFrom"
														placeholder="datetime placeholder"
														value={dateFormatter.toDateTimeString(dateFrom)}
														onChange={this.handleChangeDateFrom}
													/>
												</Col>
												<Label for="dateTo" sm={1} className="label-datepicker">
													To
												</Label>
												<Col sm={4} className="col-datepicker">
													<Input
														className="datepicker"
														type="datetime-local"
														name="datetime"
														id="dateTo"
														placeholder="datetime placeholder"
														value={dateFormatter.toDateTimeString(dateTo)}
														onChange={this.handleChangeDateTo}
													/>
												</Col>
												<Col sm={1} />
											</FormGroup>
										</Form>
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
											<BarChartSystemPowerConsumption
												lsLogPower={lsLogPower}
												system={system}
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
