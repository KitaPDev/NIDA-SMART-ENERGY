import React from "react";

import "./SetTarget.css";
import {
	Row,
	Col,
	Container,
	Form,
	FormGroup,
	Label,
	Input,
	Button,
} from "reactstrap";
import { MdPeople } from "react-icons/md";
import { RiFileExcel2Fill } from "react-icons/ri";

import MixedChartBillCompare from "./MixedChartBillCompare/MixedChartBillCompare";

import http from "../../../utils/http";

const lsMonth = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

class SetTarget extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			lsMonth: lsMonth,
			lsBuilding: [],
			lsTarget: [],
			lsTargetDisplay: [],
			lastMonthTarget_bill: 0,
			lastMonthActual_bill: 0,
			lastYearTarget_bill: 0,
			lastYearActual_bill: 0,
			monthAverage_bill: 0,
			yearAverage_bill: 0,
			lastMonthTarget_usage: 0,
			lastMonthActual_usage: 0,
			lastYearTarget_usage: 0,
			lastYearActual_usage: 0,
			monthAverage_usage: 0,
			yearAverage_usage: 0,
			building: "Auditorium",
			month: new Date().getMonth(),
			year: new Date().getFullYear(),
			monthDisplay: new Date().getMonth(),
			yearDisplay: new Date().getFullYear(),
			electricityBill: "",
			energyUsage: "",
			amountPeople: "",
			tariff: "",
			compareToBill: "Target",
			compareToUsage: "Target",
		};

		this.onClickCompareToBill = this.onClickCompareToBill.bind(this);
		this.onClickCompareToUsage = this.onClickCompareToUsage.bind(this);

		this.setTarget = this.setTarget.bind(this);

		this.getAllBuilding = this.getAllBuilding.bind(this);
		this.getTarget_monthYear = this.getTarget_monthYear.bind(this);
		this.getTarget_monthYear_display =
			this.getTarget_monthYear_display.bind(this);
		this.getTargetPresets = this.getTargetPresets.bind(this);
	}

	componentDidMount() {
		this.getAllBuilding();
		this.getTarget_monthYear();
		this.getTarget_monthYear_display();
	}

	async getAllBuilding() {
		try {
			let resp = await http.get("/building/all");

			this.setState({ lsBuilding: resp.data }, () => this.getTargetPresets());
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	handleInputChange(e) {
		this.setState({ [e.target.name]: e.target.value }, () => {
			if (
				e.target.name === "month" ||
				e.target.name === "year" ||
				e.target.name === "building"
			) {
				this.getTargetPresets();
			}

			if (e.target.name === "monthDisplay" || e.target.name === "yearDisplay") {
				this.getTarget_monthYear_display();
			}
		});
	}

	onClickCompareToBill(compareToBill) {
		this.setState({
			compareToBill: compareToBill,
		});
	}

	onClickCompareToUsage(compareToUsage) {
		this.setState({
			compareToUsage: compareToUsage,
		});
	}

	async setTarget() {
		try {
			let {
				lsBuilding,
				lsTarget,
				building,
				month,
				year,
				electricityBill,
				energyUsage,
				amountPeople,
				tariff,
			} = this.state;

			let buildingID;
			for (let b of lsBuilding) {
				if (b.label === building) {
					buildingID = b.id;
					break;
				}
			}

			let target = lsTarget.find(
				(t) => t.month === +month && t.year === +year && t.building === building
			);

			let payload = {
				building_id: buildingID,
				month: month,
				year: year,
			};

			payload.tariff = target.tariff;
			if (tariff.length > 0) {
				payload.tariff = +tariff;
			}

			payload.electricity_bill = target.electricity_bill;
			if (electricityBill.length > 0) {
				payload.electricity_bill = +electricityBill;
			}

			payload.energy_usage = target.energy_usage;
			if (energyUsage.length > 0) {
				payload.energy_usage = +energyUsage;
			}

			payload.amount_people = target.amount_people;
			if (amountPeople.length > 0) {
				payload.amount_people = +amountPeople;
			}

			let resp = await http.post("/target", payload);

			if (resp.status === 200) {
				this.getTarget_monthYear();
				this.getTarget_monthYear_display();
				this.getTargetPresets();

				alert("Target set successful.");
				this.setState({
					electricityBill: "",
					energyUsage: "",
					amountPeople: "",
					tariff: "",
				});
			}
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async getTarget_monthYear() {
		try {
			let { month, year } = this.state;

			let payload = {
				month: month,
				year: year,
			};

			let resp = await http.post("/target/monthyear", payload);

			let lsTarget = resp.data;

			this.setState({
				lsTarget: lsTarget,
			});
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async getTarget_monthYear_display() {
		try {
			let { monthDisplay, yearDisplay } = this.state;

			let payload = {
				month: monthDisplay,
				year: yearDisplay,
			};

			let resp = await http.post("/target/monthyear", payload);

			let lsTargetDisplay = resp.data;

			this.setState({
				lsTargetDisplay: lsTargetDisplay,
			});
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async getTargetPresets() {
		try {
			let { month, year, building, lsBuilding } = this.state;

			let payload = {
				month: month,
				year: year,
				building_id: lsBuilding.find((b) => b.label === building).id,
			};

			let resp = await http.post("/target/presets", payload);

			let presets = resp.data;
			this.setState({
				lastMonthTarget_bill: presets.lastMonthTarget_bill,
				lastMonthActual_bill: presets.lastMonthActual_bill,
				lastYearTarget_bill: presets.lastYearTarget_bill,
				lastYearActual_bill: presets.lastYearActual_bill,
				monthAverage_bill: presets.monthAverage_bill,
				yearAverage_bill: presets.yearAverage_bill,
				lastMonthTarget_usage: presets.lastMonthTarget_usage,
				lastMonthActual_usage: presets.lastMonthActual_usage,
				lastYearTarget_usage: presets.lastYearTarget_usage,
				lastYearActual_usage: presets.lastYearActual_usage,
				monthAverage_usage: resp.data.monthAverage_usage,
				yearAverage_usage: presets.yearAverage_usage,
			});
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	render() {
		let {
			lsMonth,
			lsBuilding,
			lsTarget,
			lsTargetDisplay,
			lastMonthTarget_bill,
			lastMonthActual_bill,
			lastYearTarget_bill,
			lastYearActual_bill,
			monthAverage_bill,
			yearAverage_bill,
			lastMonthTarget_usage,
			lastMonthActual_usage,
			lastYearTarget_usage,
			lastYearActual_usage,
			monthAverage_usage,
			yearAverage_usage,
			yearDisplay,
			monthDisplay,
			building,
			month,
			year,
			tariff,
			electricityBill,
			amountPeople,
			energyUsage,
			compareToBill,
			compareToUsage,
		} = this.state;

		let currentYear = new Date().getFullYear();
		let end = currentYear + 100;
		let lsYear = [];
		for (let i = currentYear - 10; i < end; i++) lsYear.push(i);

		let target = lsTarget.find(
			(t) => t.month === +month && t.year === +year && t.building === building
		);

		return (
			<div className="container-set-target">
				<Row className="row-heading">
					<Col sm={4} className="heading">
						Set Target
					</Col>
					<Col sm={8} className="heading-historical-data">
						<span className="title">Historical Data</span>
						<RiFileExcel2Fill size={30} className="icon-excel" />
						<Button className="btn-period">Monthly</Button>
						<Button className="btn-period">Yearly</Button>
					</Col>
				</Row>

				<Row className="row-content">
					<Col sm={4} className="col-left">
						{/* ******************************** CONFIG PANE ******************************** */}
						<Row className="row-config">
							<Form className="form-target">
								<FormGroup row className="fg-config-1">
									<Label for="month" sm={2}>
										Month
									</Label>
									<Col sm={4}>
										<Input
											type="select"
											name="month"
											id="monthSelect"
											value={month}
											onChange={this.handleInputChange}
										>
											{lsMonth.map((m, idx) => (
												<option key={m} label={m} value={idx}></option>
											))}
										</Input>
									</Col>
									<Label for="year" sm={2}>
										Year
									</Label>
									<Col sm={4}>
										<Input
											type="select"
											name="year"
											id="yearSelect"
											value={year}
											onChange={this.handleInputChange}
										>
											{lsYear.map((year) => (
												<option>{year}</option>
											))}
										</Input>
									</Col>
								</FormGroup>
								<FormGroup row className="fg-config-building">
									<Label for="building" sm={2}>
										Building
									</Label>
									<Col sm={4}>
										<Input
											type="select"
											name="building"
											id="buildingSelect"
											onChange={this.handleInputChange}
										>
											{lsBuilding.map((building) => (
												<option key={building}>{building.label}</option>
											))}
										</Input>
									</Col>
									<Col sm={6} />
								</FormGroup>
								<FormGroup row className="fg-config-people">
									<Label
										for="amountPeople"
										sm={3}
										style={{
											color: "black",
											width: "fit-content",
										}}
									>
										People <MdPeople />
									</Label>
									<Col sm={6}>
										<Input
											type="number"
											name="amountPeople"
											id="amountPeople"
											min="0"
											placeholder={
												target
													? target.amount_people !== null
														? target.amount_people
														: "Enter Amount"
													: "Enter Amount"
											}
											autoComplete="off"
											onChange={this.handleInputChange}
											value={amountPeople}
										/>
									</Col>
									<Col sm={3} />
								</FormGroup>
								<FormGroup row className="fg-config-tariff">
									<Label
										for="tariff"
										sm={3}
										style={{
											color: "black",
											width: "fit-content",
										}}
									>
										Tariff (Baht/kWh)
									</Label>
									<Col sm={3}>
										<Input
											type="number"
											name="tariff"
											id="tariff"
											min="0"
											placeholder={
												target
													? target.tariff !== null
														? target.tariff
														: "4"
													: "4"
											}
											autoComplete="off"
											onChange={this.handleInputChange}
											value={tariff}
										/>
									</Col>
									<Col sm={3} />
								</FormGroup>
								<FormGroup row className="fg-config-bill">
									<Label for="amountBill" sm={4}>
										Electricity Bill (THB)
									</Label>
									<Col sm={6}>
										<Input
											list="presets-bill"
											type="number"
											name="electricityBill"
											id="electricityBill"
											min="0"
											placeholder={
												target
													? target.electricity_bill !== null
														? target.electricity_bill
														: "Enter Amount"
													: "Enter Amount"
											}
											autoComplete="off"
											onChange={this.handleInputChange}
											value={electricityBill}
										/>
										<datalist id="presets-bill">
											<option
												label="Last Month Target"
												value={lastMonthTarget_bill}
											/>
											<option
												label="Last Month Actual"
												value={lastMonthActual_bill}
											/>
											<option
												label="Last Year Target"
												value={lastYearTarget_bill}
											/>
											<option
												label="Last Year Actual"
												value={lastYearActual_bill}
											/>
											<option label="Month Average" value={monthAverage_bill} />
											<option label="Year Average" value={yearAverage_bill} />
										</datalist>
									</Col>
									<Col sm={2} style={{ fontWeight: "600", margin: "auto" }}>
										Baht
									</Col>
								</FormGroup>
								<FormGroup row className="fg-config-usage">
									<Label for="energyUsage" sm={4}>
										Energy Usage
									</Label>
									<Col sm={6}>
										<Input
											list="presets-usage"
											type="number"
											name="energyUsage"
											id="energyUsage"
											min="0"
											placeholder={
												target
													? target.energy_usage !== null
														? target.energy_usage
														: "Enter Amount"
													: "Enter Amount"
											}
											autoComplete="off"
											onChange={this.handleInputChange}
											value={energyUsage}
										/>
										<datalist id="presets-usage">
											<option
												label="Last Month Target"
												value={lastMonthTarget_usage}
											/>
											<option
												label="Last Month Actual"
												value={lastMonthActual_usage}
											/>
											<option
												label="Last Year Target"
												value={lastYearTarget_usage}
											/>
											<option
												label="Last Year Actual"
												value={lastYearActual_usage}
											/>
											<option
												label="Month Average"
												value={monthAverage_usage}
											/>
											<option label="Year Average" value={yearAverage_usage} />{" "}
										</datalist>
									</Col>
									<Col sm={2} style={{ fontWeight: "600", margin: "auto" }}>
										kWh
									</Col>
								</FormGroup>
								<FormGroup row>
									<Col sm={8} className="col-note">
										<span
											style={{
												textDecoration: "underline",
												alignSelf: "flex-end",
												width: "fit-content",
												paddingRight: 0,
											}}
										>
											*Note:
										</span>
										<span
											style={{
												alignSelf: "flex-end",
												marginLeft: "0.2rem",
												width: "fit-content",
												paddingLeft: 0,
											}}
										>
											Electricity bill is estimated
										</span>
									</Col>
									<Col sm={4} className="col-btn-set-target">
										<Button className="btn-set-target" onClick={this.setTarget}>
											Set
										</Button>
									</Col>
								</FormGroup>
							</Form>
						</Row>

						{/* ****************************** List Pane **************************** */}
						<div className="list-pane">
							<div className="form">
								<Label for="monthDisplay">Month</Label>

								<Input
									type="select"
									name="monthDisplay"
									id="monthDisplaySelect"
									value={monthDisplay}
									onChange={this.handleInputChange}
								>
									{lsMonth.map((month, index) => (
										<option key={month} label={month} value={index}></option>
									))}
								</Input>

								<Label for="yearDisplay">Year</Label>

								<Input
									type="select"
									name="yearDisplay"
									id="yearDisplaySelect"
									value={yearDisplay}
									onChange={this.handleInputChange}
								>
									{lsYear.map((year) => (
										<option>{year}</option>
									))}
								</Input>
							</div>
							<table className="table-building-users">
								<thead>
									<tr>
										<th>Building</th>
										<th>Users</th>
										<th>Tariff</th>
									</tr>
								</thead>
								<tbody>
									{lsBuilding.map((building) => (
										<tr className="tr-building">
											<td className="td-building">
												<div
													className="square-building"
													style={{
														backgroundColor: building.color_code,
													}}
												/>
												<div className="building-label">{building.label}</div>
											</td>
											<td className="td-users">
												{lsTargetDisplay.find(
													(target) =>
														target.month === +monthDisplay &&
														target.year === +yearDisplay &&
														target.building === building.label
												)
													? lsTargetDisplay.find(
															(target) =>
																target.month === +monthDisplay &&
																target.year === +yearDisplay &&
																target.building === building.label
													  ).amount_people !== null
														? lsTargetDisplay.find(
																(target) =>
																	target.month === +monthDisplay &&
																	target.year === +yearDisplay &&
																	target.building === building.label
														  ).amount_people
														: "N/A"
													: "N/A"}
											</td>
											<td className="td-tariff">
												{lsTargetDisplay.find(
													(target) =>
														target.month === +monthDisplay &&
														target.year === +yearDisplay &&
														target.building === building.label
												)
													? lsTargetDisplay.find(
															(target) =>
																target.month === +monthDisplay &&
																target.year === +yearDisplay &&
																target.building === building.label
													  ).tariff !== null
														? lsTargetDisplay.find(
																(target) =>
																	target.month === +monthDisplay &&
																	target.year === +yearDisplay &&
																	target.building === building.label
														  ).tariff
														: "N/A"
													: "N/A"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</Col>
					<Col sm={8} className="col-right">
						{/* ****************************** HISTORICAL DATA PANE *****************************/}
						<Container fluid className="container-historical-data">
							{/* ****************************** CHART 1 **************************** */}

							<Row className="row-chart">
								<Col sm={10} className="col-chart">
									<MixedChartBillCompare
										compareTo={compareToBill}
										lsBuilding={lsBuilding}
									/>
								</Col>
								<Col sm={2} className="col-form">
									<Row>
										<Form className="form-historical-data-charts">
											<Row>
												<span className="dot-actual"></span>
												<span className="label-actual">Actual</span>
											</Row>
											<FormGroup row>
												<Label check>
													<Input
														type="radio"
														name="compareToBill"
														onChange={() => this.onClickCompareToBill("Target")}
														checked={compareToBill === "Target"}
													/>
													Target
												</Label>
												<Label check>
													<Input
														type="radio"
														name="compareToBill"
														onChange={() =>
															this.onClickCompareToBill("Average")
														}
														checked={compareToBill === "Average"}
													/>
													Average
												</Label>
											</FormGroup>
										</Form>
									</Row>
								</Col>
							</Row>
						</Container>
					</Col>
				</Row>
			</div>
		);
	}
}

export default SetTarget;
