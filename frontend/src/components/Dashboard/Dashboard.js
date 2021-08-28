import React from "react";

// Styling and Graphics
import "./Dashboard.css";
import { Row, Col, Label, Input, Button, Form, FormGroup } from "reactstrap";
import { RiFileExcel2Fill } from "react-icons/ri";

// Charts and Diagrams
import PieChartEnergySource from "./PieChartEnergySource/PieChartEnergySource";
import PieChartSystem from "./PieChartSystem/PieChartSystem";
import LineChartBuildingPowerConsumption from "./LineChartBuildingPowerConsumption/LineChartBuildingPowerConsumption";
import BarChartSystemPowerConsumption from "./BarChartSystemPowerConsumption/BarChartSystemPowerConsumption";
import BarChartElectricityBill from "./BarChartElectricityBill/BarChartElectricityBill";
import MixedChartBillCompareDate from "./MixedChartBillCompareDate/MixedChartBillCompareDate";
import MixedChartBillCompare from "./MixedChartBillCompare/MixedChartBillCompare";

// Utils
import http from "../../utils/http";
import dateFormatter from "../../utils/dateFormatter";
import numberFormatter from "../../utils/numberFormatter";

// API Service
import {
	subjectPowerMeterData,
	subjectSolarData,
	apiService,
} from "../../apiService";
import csv from "../../utils/csv";
import MixedChartKwTempHumi from "./MixedChartKwTempHumi/MixedChartKwTempHumi";

let subscriberPowerMeterData;
let subscriberSolarData;

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
			kwh_system_building: {},
			lsKw_system_building: {},
			bill_building: {},
			tariff_building: {},
			targetBill_building: {},
			kwhSolar: 0,
			compareTo: "Target",
			lsTempHumi: [],
		};

		this.updateData = this.updateData.bind(this);

		this.getAllBuilding = this.getAllBuilding.bind(this);
		this.getAllSystem = this.getAllSystem.bind(this);
		this.getAllTargetByMonthYear = this.getAllTargetByMonthYear.bind(this);
		this.getSolarCurrentMonth = this.getSolarCurrentMonth.bind(this);
		this.getDataIaqByDatetime = this.getDataIaqByDatetime.bind(this);

		this.handleInputDateChange = this.handleInputDateChange.bind(this);
		this.onClickApply = this.onClickApply.bind(this);
		this.onClickBuilding = this.onClickBuilding.bind(this);
		this.onClickAllBuilding = this.onClickAllBuilding.bind(this);
		this.onClickCompareTo = this.onClickCompareTo.bind(this);

		this.exportPieCharts = this.exportPieCharts.bind(this);
		this.exportLineChartPower = this.exportLineChartPower.bind(this);
		this.exportBarChartPower = this.exportBarChartPower.bind(this);
		this.exportBarChartElectricityBill =
			this.exportBarChartElectricityBill.bind(this);
	}

	async componentDidMount() {
		await this.getAllBuilding();
		await this.updateData();

		subscriberPowerMeterData = subjectPowerMeterData.subscribe((dataPower) => {
			let { tariff_building } = this.state;
			let kwh_system_building = {};
			let lsKw_system_building = {};
			let bill_building = {};

			if (!dataPower) return;

			let lsDeviceFirst = [];
			let lsDeviceLast = [];

			for (let data of dataPower.slice().reverse()) {
				let building = data.building;
				let device = data.device;
				let kwh = Math.round((data.kwh * 100) / 100);
				let system = data.system;
				let floor = data.floor;

				if (system === "Main" && floor !== null) continue;

				if (!lsDeviceLast.find((d) => d === device) && kwh !== 0) {
					lsDeviceLast.push(device);
				} else continue;

				if (kwh_system_building[building] === undefined)
					kwh_system_building[building] = {};

				if (kwh_system_building[building][system] === undefined)
					kwh_system_building[building][system] = 0;

				kwh_system_building[building][system] += kwh;
			}

			for (let data of dataPower) {
				let datetime = new Date(data.data_datetime);
				let building = data.building;
				let device = data.device;
				let kwh = Math.round((data.kwh * 100) / 100);
				let kw = Math.round((data.kw * 100) / 100);
				let system = data.system;
				let floor = data.floor;

				if (system === "Main" && floor !== null) continue;

				if (lsKw_system_building[building] === undefined)
					lsKw_system_building[building] = {};

				if (lsKw_system_building[building][system] === undefined) {
					lsKw_system_building[building][system] = [];
				}

				lsKw_system_building[building][system].push({
					datetime: datetime,
					kw: kw,
				});

				if (!lsDeviceFirst.find((d) => d === device) && kwh !== 0)
					lsDeviceFirst.push(device);
				else continue;

				kwh_system_building[building][system] -= kwh;
			}

			for (let [building, kwh_system] of Object.entries(kwh_system_building)) {
				let tariff = 4;
				if (tariff_building[building] !== undefined) {
					if (tariff_building[building] !== null) {
						tariff = tariff_building[building];
					}
				}

				if (bill_building[building]) bill_building[building] = 0;
				bill_building[building] = kwh_system.Main * tariff;
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
	}

	componentWillUnmount() {
		if (subscriberPowerMeterData) subscriberPowerMeterData.unsubscribe();
		if (subscriberSolarData) subscriberSolarData.unsubscribe();
		clearInterval(this.intervalTime);
		clearInterval(this.intervalApi);
	}

	async updateData() {
		let { dateFrom, dateTo } = this.state;

		apiService.updatePowerMeterData(dateFrom, dateTo);
		apiService.updateSolarData(dateFrom, dateTo);
		this.getDataIaqByDatetime(dateFrom, dateTo);

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

	async getAllTargetByMonthYear() {
		try {
			let today = new Date();
			let payload = {
				month: today.getMonth() + 1,
				year: today.getFullYear(),
			};

			let resp = await http.post("/target/monthyear", payload);
			let lsTarget = resp.data;

			let tariff_building = {};
			let targetBill_building = {};
			for (let target of lsTarget) {
				let building = target.building;
				let tariff = target.tariff;
				let bill = target.electricity_bill;

				tariff_building[building] = tariff;
				targetBill_building[building] = bill;
			}

			this.setState({
				tariff_building: tariff_building,
				targetBill_building: targetBill_building,
			});
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

	async getDataIaqByDatetime(dateStart, dateEnd) {
		try {
			let payload = {
				start: dateStart,
				end: dateEnd,
			};

			let resp = await http.post("/api/iaq/datetime", payload);

			this.setState({
				lsTempHumi: resp.data,
			});
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
		lsSelectedBuilding = lsBuilding.map((building) => building.label);
		this.setState({ lsSelectedBuilding: lsSelectedBuilding });
	}

	onClickCompareTo(compareTo) {
		this.setState({
			compareTo: compareTo,
		});
	}

	exportPieCharts() {
		let { lsBuilding, lsSelectedBuilding, kwh_system_building, kwhSolar } =
			this.state;

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

		let rows = [[]];

		rows[0].push("MEA", "Solar Cells");
		rows[1] = [kwhMainTotal, kwhSolar];
		rows[2] = ["", ""];
		rows[3] = ["Air Conditioner", "Others"];
		rows[4] = [kwhAcTotal, kwhMainTotal - kwhAcTotal];

		csv.exportFile(`Dashboard Pie Charts`, rows);
	}

	exportLineChartPower() {
		let { lsKw_system_building } = this.state;

		let rows = [[]];
		rows[0].push("Datetime");

		for (let [building, lsKw_system] of Object.entries(lsKw_system_building)) {
			rows[0].push(building);

			let lsLogKwMain = [];
			if (lsKw_system["Main"]) {
				lsKw_system["Main"].forEach((log) => lsLogKwMain.push(log));
			}

			let lsLogKwMain_clean = [];
			lsLogKwMain.forEach(function (log) {
				if (!this[log.datetime]) {
					this[log.datetime] = { datetime: log.datetime, kw: 0 };
					lsLogKwMain_clean.push(this[log.datetime]);
				}
				this[log.datetime].kw += log.kw;
			}, Object.create(null));

			lsLogKwMain_clean.forEach((log, idx) => {
				if (!rows[idx + 1]) {
					rows[idx + 1] = [];
					rows[idx + 1].push(
						dateFormatter.ddmmmyyyyhhmm_noOffset(log.datetime)
					);
				}
				rows[idx + 1].push(log.kw);
			});
		}

		csv.exportFile(`Buildings Power Consumption`, rows);
	}

	exportBarChartPower() {
		let { lsKw_system_building } = this.state;

		let lsLogKwMain = [];
		let lsLogKwAc = [];

		let lsLogKwMain_clean = [];
		let lsLogKwAc_clean = [];
		let lsLogKwOthers_clean = [];

		for (let [_, lsKw_system] of Object.entries(lsKw_system_building)) {
			if (lsKw_system["Main"]) {
				lsKw_system["Main"].forEach((log) => lsLogKwMain.push(log));
			}

			if (lsKw_system["Air Conditioner"]) {
				lsKw_system["Air Conditioner"].forEach((log) => lsLogKwAc.push(log));
			}
		}

		lsLogKwMain.slice().forEach(function (log) {
			if (!this[log.datetime]) {
				this[log.datetime] = { datetime: log.datetime, kw: 0 };
				lsLogKwMain_clean.push(this[log.datetime]);
			}
			this[log.datetime].kw += log.kw;
		}, Object.create(null));

		lsLogKwAc.slice().forEach(function (log) {
			if (!this[log.datetime]) {
				this[log.datetime] = { datetime: log.datetime, kw: 0 };
				lsLogKwAc_clean.push(this[log.datetime]);
			}
			this[log.datetime].kw += log.kw;
		}, Object.create(null));

		lsLogKwMain_clean.forEach((logKwMain, idx) => {
			if (lsLogKwAc[idx]) {
				lsLogKwOthers_clean.push({
					datetime: logKwMain.datetime,
					kw: logKwMain.kw - lsLogKwAc[idx].kw,
				});
			} else lsLogKwOthers_clean.push(logKwMain);
		});

		let rows = [[]];
		rows[0].push("Datetime", "kW - Air Conditioner", "kW - Others");

		lsLogKwAc_clean.forEach((logKwAc, idx) => {
			if (!rows[idx + 1]) rows[idx + 1] = [];
			rows[idx + 1].push(
				dateFormatter.yyyymmddhhmmss_noOffset(logKwAc.datetime),
				logKwAc.kw,
				lsLogKwOthers_clean[idx].kw
			);
		});

		csv.exportFile(`Systems Power Consumption`, rows);
	}

	exportBarChartElectricityBill() {
		let { bill_building } = this.state;
		let rows = [[]];
		rows[0].push("Building", "Bill (THB)");

		Object.entries(bill_building).forEach(([building, bill]) => {
			rows.push([building, bill]);
		});

		csv.exportFile(`Electricity Bill`, rows);
	}

	render() {
		let {
			dateFrom,
			dateTo,
			displayDateFrom,
			displayDateTo,
			lsBuilding,
			lsSelectedBuilding,
			kwh_system_building,
			lsKw_system_building,
			bill_building,
			kwhSolar,
			compareTo,
			lsTempHumi,
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
					{/* ****************************** Date Row *****************************/}
					<div className="row-date">
						{dateFormatter.ddmmmyyyyhhmm_noOffset(displayDateFrom) +
							" - " +
							dateFormatter.ddmmmyyyyhhmm_noOffset(displayDateTo)}
					</div>

					{/* ****************************** Total Energy Consumption Pane *****************************/}
					<div className="container-pie-charts">
						<div>
							<RiFileExcel2Fill
								className="icon-excel"
								size={25}
								onClick={this.exportPieCharts}
							/>
						</div>
						<div className="row-pie-charts-title">
							<span className="pie-charts-title-1">
								Total Energy Consumption
							</span>
							<span className="pie-charts-title-2">
								{numberFormatter.withCommas(Math.round(kwhMainTotal))}
							</span>
							<span className="pie-charts-title-1">kWh</span>
						</div>
						<div className="row-pie-charts">
							<div className="legend">
								<div className="legend-title">From</div>
								<div className="legend-row">
									<span className="dot-grey" /> <span>MEA</span>
								</div>
								<div className="legend-row">
									<span className="dot-orange" /> <span>Solar Cells</span>
								</div>
							</div>
							<div className="pie-chart">
								<PieChartEnergySource mea={kwhMainTotal} solar={kwhSolar} />
							</div>
							<div className="legend">
								<div className="legend-title">Used in</div>
								<div className="legend-row">
									<span className="dot-blue" /> <span>Air Conditioner</span>
								</div>
								<div className="legend-row">
									<span className="dot-red" /> <span>Others</span>
								</div>
							</div>
							<div className="pie-chart">
								<PieChartSystem
									ac={kwhAcTotal}
									others={kwhMainTotal - kwhAcTotal}
									building={
										lsSelectedBuilding.length === 1 ? lsSelectedBuilding[0] : ""
									}
								/>
							</div>
						</div>
					</div>

					{/* ****************************** Power (kW) Charts *****************************/}
					<div className="container-kw-charts">
						<div className="row-chart">
							<RiFileExcel2Fill
								className="icon-excel"
								size={25}
								onClick={this.exportLineChartPower}
							/>
							<LineChartBuildingPowerConsumption
								lsSelectedBuilding={lsSelectedBuilding}
								lsKw_system_building={lsKw_system_building}
								lsBuilding={lsBuilding}
								dateFrom={dateFrom}
								dateTo={dateTo}
							/>
						</div>
						<div className="row-chart">
							<RiFileExcel2Fill
								className="icon-excel"
								size={25}
								onClick={this.exportBarChartPower}
							/>
							<BarChartSystemPowerConsumption
								lsSelectedBuilding={lsSelectedBuilding}
								lsKw_system_building={lsKw_system_building}
								lsBuilding={lsBuilding}
								dateFrom={dateFrom}
								dateTo={dateTo}
							/>
						</div>
					</div>
				</div>

				{/* ******************************** Right Section *****************************/}
				<div id="dashboard-right">
					<div className="container-bill-1">
						<RiFileExcel2Fill
							className="icon-excel"
							size={25}
							onClick={this.exportBarChartElectricityBill}
						/>
						<BarChartElectricityBill
							lsSelectedBuilding={lsSelectedBuilding}
							bill_building={bill_building}
							lsBuilding={lsBuilding}
						/>
					</div>
					<div className="container-bill-2">
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
												onChange={() => this.onClickCompareTo("Average")}
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
												onChange={() => this.onClickCompareTo("Last Year")}
											/>
											Last Year
										</Label>
									</FormGroup>
								</Form>
							</Col>
							{displayDateFrom.getDate() === displayDateTo.getDate() ? (
								<MixedChartBillCompare
									compareTo={compareTo}
									lsBuilding={lsBuilding}
								/>
							) : (
								<MixedChartBillCompareDate
									compareTo={compareTo}
									lsSelectedBuilding={lsSelectedBuilding}
									dateFrom={displayDateFrom}
									dateTo={displayDateTo}
								/>
							)}
						</Row>
					</div>
					<div className="container-bill-3">
						<MixedChartKwTempHumi
							lsSelectedBuilding={lsSelectedBuilding}
							lsKw_system_building={lsKw_system_building}
							lsBuilding={lsBuilding}
							dateFrom={dateFrom}
							dateTo={dateTo}
							lsTempHumi={lsTempHumi}
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default Dashboard;
