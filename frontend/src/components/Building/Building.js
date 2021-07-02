import React from "react";
import { Container, Row, Col } from "reactstrap";
import "./Building.css";
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
import BarChartElectricalSystemPowerConsumption from "./BarChartElectricalSystemPowerConsumption/BarChartElectricalSystemPowerConsumption";

class Building extends React.Component {
	constructor(props) {
		super(props);

		let tzOffset = new Date().getTimezoneOffset() * 60000;

		let dateFrom = new Date(
			new Date(new Date(Date.now() - tzOffset).setHours(0, 0, 0, 0)) - tzOffset
		);

		this.state = {
			dateFrom: dateFrom.toISOString().substring(0, 16),
			dateTo: new Date(Date.now() - tzOffset).toISOString().substring(0, 16),
			isElectricalSystemDropdownOpen: false,
			electricalSystem: "Overall",
		};

		this.state.lsBuilding = [
			"Auditorium",
			"Bunchana",
			"Chup",
			"Malai",
			"Narathip",
			"Navamin",
			"Nida House",
			"Nidasumpan",
			"Ratchaphruek",
			"Serithai",
			"Siam",
		];

		let building = this.props.building;

		building === undefined
			? (this.state.building = "Auditorium")
			: (this.state.building = building);

		this.state.amountPeople = 30;

		this.getColorCode = this.getColorCode.bind(this);
		this.handleChangeDateFrom = this.handleChangeDateFrom.bind(this);
		this.handleChangeDateTo = this.handleChangeDateTo.bind(this);
		this.toggleElectricalSystem = this.toggleElectricalSystem.bind(this);
		this.changeElectricalSystem = this.changeElectricalSystem.bind(this);
	}

	getColorCode(building) {
		switch (building.toUpperCase()) {
			case "NAVAMIN":
				return "#BFF0B5";

			case "SIAM":
				return "#FA999A";

			case "BUNCHANA":
				return "#CCEBFF";

			case "NIDA HOUSE":
				return "#DCC87E";

			case "MALAI":
				return "#FFDFB3";

			case "CHUP":
				return "#FFBE7C";

			case "NIDASUMPAN":
				return "#FFECA0";

			case "NARATHIP":
				return "#9BCD95";

			case "RATCHAPHRUEK":
				return "#91C5C2";

			case "SERITHAI":
				return "#B9DFDB";

			case "AUDITORIUM":
				return "#95B2D1";

			default:
				return "#000000";
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

	toggleElectricalSystem() {
		this.setState((prevState) => ({
			isElectricalSystemDropdownOpen: !prevState.isElectricalSystemDropdownOpen,
		}));
	}

	changeElectricalSystem(e) {
		this.setState({
			electricalSystem: e.currentTarget.textContent,
		});
	}

	render() {
		let {
			lsBuilding,
			building,
			amountPeople,
			dateFrom,
			dateTo,
			isElectricalSystemDropdownOpen,
			electricalSystem,
		} = this.state;

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
			if (log.building === building) {
				lsLogPower = log;
				break;
			}
		}

		return (
			<div>
				<Container style={{ padding: "1rem" }} fluid>
					<Row>
						<Col sm={2}>
							<div className="building-list-pane">
								<p id="heading-1">Building</p>
								{lsBuilding.map((bld) => (
									<div>
										<Row
											className="row-building"
											style={{ opacity: bld === building ? 1 : 0.5 }}
											onClick={() => this.setState({ building: bld })}
										>
											<Col sm={2} className="col-square-building">
												<div
													className="square-building"
													style={{
														backgroundColor: this.getColorCode(bld),
													}}
												></div>
											</Col>
											<Col sm={10}>{bld}</Col>
										</Row>
									</div>
								))}
							</div>
						</Col>
						<Col sm={10} style={{ paddingLeft: "1rem" }}>
							<Row>
								<Col sm={5}>
									<Row
										className="row-title"
										style={{ color: this.getColorCode(building) }}
									>
										{building}
									</Row>
									<Row
										className="row-heading"
										style={{ color: this.getColorCode(building) }}
									>
										<p>
											Estimated{" "}
											<span style={{ fontSize: "150%", fontWeight: "bold" }}>
												{amountPeople}
											</span>{" "}
											people{" "}
											<span>
												<MdPeople size="1.5em" style={{ margin: "auto" }} />
											</span>
										</p>
									</Row>
								</Col>
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
														value={dateFrom}
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
														value={dateTo}
														onChange={this.handleChangeDateTo}
													/>
												</Col>
												<Col sm={1} />
											</FormGroup>
										</Form>
									</Row>
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
													isOpen={isElectricalSystemDropdownOpen}
													toggle={this.toggleElectricalSystem}
												>
													<DropdownToggle color="transparent" caret>
														{electricalSystem}
													</DropdownToggle>
													<DropdownMenu>
														<DropdownItem onClick={this.changeElectricalSystem}>
															Overall
														</DropdownItem>
														<DropdownItem onClick={this.changeElectricalSystem}>
															A/C
														</DropdownItem>
														<DropdownItem onClick={this.changeElectricalSystem}>
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
											<BarChartElectricalSystemPowerConsumption
												lsLogPower={lsLogPower}
												electricalSystem={electricalSystem}
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
