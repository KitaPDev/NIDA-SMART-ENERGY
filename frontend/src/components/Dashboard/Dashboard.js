import React from "react";

// Styling and Graphics
import "./Dashboard.css";
import { Row, Col, Label, Input, Button } from "reactstrap";

// Charts and Diagrams
import PieChartEnergySource from "./PieChartEnergySource/PieChartEnergySource";
import PieChartSystem from "./PieChartSystem/PieChartSystem";
import LineChartBuildingPowerConsumption from "./LineChartBuildingPowerConsumption/LineChartBuildingPowerConsumption";
import BarChartSystemPowerConsumption from "./BarChartSystemPowerConsumption/BarChartSystemPowerConsumption";

// Utils
import http from "../../utils/http";
import dateFormatter from "../../utils/dateFormatter";
import numberFormatter from "../../utils/numberFormatter";
import colorConverter from "../../utils/colorConverter";

// API Service
import {
	subjectPowerMeterData,
	subjectSolarData,
	apiService,
} from "../../apiService";

class Dashboard extends React.Component {
	constructor(props) {
		super(props);

		let dateFrom = new Date(new Date().setHours(0, 0, 0, 0));
		let dateTo = new Date();

		this.state = {
			dateFrom: dateFrom,
			dateTo: dateTo,
			displayDateFrom: dateFrom,
			displayDateTo: dateTo,
			lsBuilding: [],
			lsSelectedBuilding: [],
			tariff_building: {},
			kwh_system_building: {},
			lsKw_system_building: {},
			bill_building: {},
		};

		this.updateData = this.updateData.bind(this);

		this.getAllBuilding = this.getAllBuilding.bind(this);
		this.getAllSystem = this.getAllSystem.bind(this);

		this.handleInputDateChange = this.handleInputDateChange.bind(this);
		this.onClickApply = this.onClickApply.bind(this);
		this.onClickBuilding = this.onClickBuilding.bind(this);
		this.onClickAllBuilding = this.onClickAllBuilding.bind(this);
	}

	async componentDidMount() {
		await this.getAllBuilding();
		await this.updateData();
	}

	async updateData() {
		// await this.getData();
		// await this.getBuildingTargetRange();
		// let { dateFrom, dateTo } = this.state;
		// this.setState({
		// 	displayDateFrom: dateFrom,
		// 	displayDateTo: dateTo,
		// });

		let { dateFrom, dateTo } = this.state;

		this.setState({
			displayDateFrom: dateFrom,
			displayDateTo: dateTo,
		});
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

	async getAllSystem() {
		try {
			let resp = await http.get("/system/all");

			this.setState({ lsSystem: resp.data });
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	handleInputDateChange(e) {
		this.setState({ [e.target.name]: new Date(e.target.value) });
	}

	onClickApply() {
		this.updateData();
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

	onClickAllBuilding() {
		let { lsSelectedBuilding, lsBuilding } = this.state;

		if (lsSelectedBuilding.length < lsBuilding.length) {
			lsBuilding.forEach((b) => lsSelectedBuilding.push(b.label));
		} else lsSelectedBuilding = [];

		this.setState({ lsSelectedBuilding: lsSelectedBuilding });
	}

	render() {
		let {
			dateFrom,
			dateTo,
			lsBuilding,
			lsSelectedBuilding,
			displayDateFrom,
			displayDateTo,
		} = this.state;

		return (
			<div id="container-dashboard">
				<div id="dashboard-filter">
					{/* ******************************** Filter Pane *****************************/}
					<div id="filter-container">
						<div className="title">Filter</div>

						{/* ****************************** Filter Form **************************** */}
						<Row className="row-form">
							<Label for="dateFrom" sm={2} className="label-datepicker">
								From
							</Label>
							<Col sm={10} className="col-datepicker">
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
						</Row>
						<Row className="row-form">
							<Label for="dateTo" sm={2} className="label-datepicker">
								To
							</Label>
							<Col sm={10} className="col-datepicker">
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
						</Row>
						<Row className="row-form apply">
							<Col sm={8} />
							<Col sm={4} style={{ textAlign: "center" }}>
								<Button id="btn-apply-bld" onClick={this.onClickApply}>
									Apply
								</Button>
							</Col>
						</Row>

						{/* ****************************** Building Section **************************** */}
						<div className="building-list-pane">
							<p className="heading-1">Building</p>
							<Row className="row-building">
								<Col sm={2}>
									<Input
										type="checkbox"
										onClick={this.onClickAllBuilding}
										checked={lsSelectedBuilding.length === lsBuilding.length}
									/>
								</Col>
								<Col sm={10}>(All)</Col>
							</Row>
							{lsBuilding.map((bld) => (
								<div>
									<Row className="row-building">
										<Col sm={2}>
											<Input
												type="checkbox"
												name={bld.label}
												onClick={() => this.onClickBuilding(bld.label)}
												checked={lsSelectedBuilding.includes(bld.label)}
											/>
										</Col>
										<Col sm={2} className="col-square-building">
											<div
												className="square-building"
												style={{
													backgroundColor: bld.color_code,
												}}
											></div>
										</Col>
										<Col sm={8}>{bld.label}</Col>
									</Row>
								</div>
							))}
						</div>

						{/* ****************************** Footer Note **************************** */}
						<div className="footer-note">
							*<span style={{ textDecoration: "underline" }}>Note</span>{" "}
							Electricity bill is estimated.
						</div>
					</div>
				</div>
				{/* ******************************** Center Section *****************************/}
				<div id="dashboard-center">
					<div className="row-date">
						{dateFormatter.ddmmmyyyyhhmm_noOffset(displayDateFrom) +
							" - " +
							dateFormatter.ddmmmyyyyhhmm_noOffset(displayDateTo)}
					</div>
					<div className="row-pie-charts">
						<div className="row-pie-charts-title">
							<span className="pie-charts-title-1">
								Total Energy Consumption
							</span>
							<span className="pie-charts-title-2">{` `}</span>
							<span className="pie-charts-title-1">kWh</span>
						</div>
					</div>
				</div>
				<div id="dashboard-right"></div>
			</div>
		);
	}
}

export default Dashboard;
