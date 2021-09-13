import React from "react";

import "./Report.css";
import { Row, Col, Label, Input } from "reactstrap";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

import http from "../../utils/http";
import dateFormatter from "../../utils/dateFormatter";
import { lsMonthFull } from "../../utils/months";
import numberFormatter from "../../utils/numberFormatter";

import { withTranslation } from "react-i18next";
import i18n from "../../i18n";

// Generating PDF documents
import { saveAs } from "file-saver";
import { pdf } from "@react-pdf/renderer";

// PDF documents
import EnergyUsageReport from "./EnergyUsageReport/EnergyUsageReport";
import ElectricityBillReport from "./ElectricityBillReport/ElectricityBillReport";
import AcPowerCompareTempHumiReport from "./AcPowerCompareTempHumiReport/AcPowerCompareTempHumiReport";
import EnergyUsePerCapitaReport from "./EnergyUsePerCapitaReport/EnergyUsePerCapitaReport";

class Report extends React.Component {
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
			isEnergyUsageReportSelected: false,
			isElectricityBillReportSelected: false,
			isAcPowerCompareTempHumiReportSelected: false,
			isEnergyUsePerCapitaReportSelected: false,
		};

		this.getAllBuilding = this.getAllBuilding.bind(this);

		this.handleInputDateChange = this.handleInputDateChange.bind(this);
		this.onClickBuilding = this.onClickBuilding.bind(this);
		this.onClickAllBuilding = this.onClickAllBuilding.bind(this);

		this.toggleEnergyUsageReport = this.toggleEnergyUsageReport.bind(this);
		this.toggleElectricityBillReport =
			this.toggleElectricityBillReport.bind(this);
		this.toggleAcPowerCompareTempHumiReport =
			this.toggleAcPowerCompareTempHumiReport.bind(this);
		this.toggleEnergyUsePerCapitaReport =
			this.toggleEnergyUsePerCapitaReport.bind(this);

		this.getKwhSystemBuilding = this.getKwhSystemBuilding.bind(this);
		this.getKwhSolar = this.getKwhSolar.bind(this);
		this.getElectricityBillBuilding =
			this.getElectricityBillBuilding.bind(this);

		this.getAllTargetBuildingPeriod =
			this.getAllTargetBuildingPeriod.bind(this);
		this.getElectricityBillBuildingMonthYear =
			this.getElectricityBillBuildingMonthYear.bind(this);

		this.generateReports = this.generateReports.bind(this);

		this.getB64PieChartBuildingEnergyUsage =
			this.getB64PieChartBuildingEnergyUsage.bind(this);
		this.getB64BarChartBuildingElectricityBill =
			this.getB64BarChartBuildingElectricityBill.bind(this);
	}

	componentDidMount() {
		this.getAllBuilding();
		Chart.register(...registerables);
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

	handleInputDateChange(e) {
		this.setState({ [e.target.name]: new Date(e.target.value) });
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

	toggleEnergyUsageReport() {
		this.setState((prevState) => ({
			isEnergyUsageReportSelected: !prevState.isEnergyUsageReportSelected,
		}));
	}

	toggleElectricityBillReport() {
		this.setState((prevState) => ({
			isElectricityBillReportSelected:
				!prevState.isElectricityBillReportSelected,
		}));
	}

	toggleAcPowerCompareTempHumiReport() {
		this.setState((prevState) => ({
			isAcPowerCompareTempHumiReportSelected:
				!prevState.isAcPowerCompareTempHumiReportSelected,
		}));
	}

	toggleEnergyUsePerCapitaReport() {
		this.setState((prevState) => ({
			isEnergyUsePerCapitaReportSelected:
				!prevState.isEnergyUsePerCapitaReportSelected,
		}));
	}

	// Data for reports
	async getKwhSystemBuilding() {
		try {
			let { lsBuilding, lsSelectedBuilding, dateFrom, dateTo } = this.state;

			let lsBuildingID = [];
			for (let bld of lsBuilding) {
				if (lsSelectedBuilding.includes(bld.label)) lsBuildingID.push(bld.id);
			}

			let payload = {
				ls_building_id: lsBuildingID,
				date_from: dateFrom,
				date_to: dateTo,
			};

			let resp = await http.post("/building/energy/datetime", payload);

			return resp.data;
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async getKwhSolar() {
		try {
			let { dateFrom, dateTo } = this.state;

			let payload = {
				start: dateFrom,
				end: dateTo,
			};

			let resp = await http.post("/api/solar/datetime", payload);

			let kwhSolar = resp.data[resp.data.length - 1].kwh - resp.data[0].kwh;

			return kwhSolar;
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async getElectricityBillBuilding() {
		try {
			let { lsBuilding, lsSelectedBuilding, dateFrom, dateTo } = this.state;

			let lsBuildingID = [];
			for (let bld of lsBuilding) {
				if (lsSelectedBuilding.includes(bld.label)) lsBuildingID.push(bld.id);
			}

			let payload = {
				ls_building_id: lsBuildingID,
				date_from: dateFrom,
				date_to: dateTo,
			};

			let resp = await http.post("/building/bill/datetime", payload);

			return resp.data;
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async getAllTargetBuildingPeriod() {
		try {
			let { lsBuilding, lsSelectedBuilding, dateFrom, dateTo } = this.state;

			let lsBuildingID = [];
			for (let bld of lsBuilding) {
				if (lsSelectedBuilding.includes(bld.label)) lsBuildingID.push(bld.id);
			}

			let payload = {
				ls_building_id: lsBuildingID,
				date_from: dateFrom,
				date_to: dateTo,
			};

			let resp = await http.post("/target/building/period", payload);

			return resp.data;
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async getElectricityBillBuildingMonthYear() {
		try {
			let { lsBuilding, lsSelectedBuilding, dateFrom, dateTo } = this.state;

			let lsBuildingID = [];
			for (let bld of lsBuilding) {
				if (lsSelectedBuilding.includes(bld.label)) lsBuildingID.push(bld.id);
			}

			let payload = {
				ls_building_id: lsBuildingID,
				date_from: dateFrom,
				date_to: dateTo,
			};

			let resp = await http.post("/building/bill/monthyear", payload);

			return resp.data;
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async generateReports() {
		let {
			isEnergyUsageReportSelected,
			isElectricityBillReportSelected,
			isAcPowerCompareTempHumiReportSelected,
			isEnergyUsePerCapitaReportSelected,
			dateFrom,
			dateTo,
			lsSelectedBuilding,
			lsBuilding,
		} = this.state;

		if (isEnergyUsageReportSelected) {
			let kwh_system_building = await this.getKwhSystemBuilding();
			let kwhSolar = await this.getKwhSolar();
			let bill_system_building = await this.getElectricityBillBuilding();

			let b64PieChartBuildingEnergyUsage =
				this.getB64PieChartBuildingEnergyUsage(
					lsSelectedBuilding,
					kwh_system_building,
					lsBuilding
				);

			if (Object.keys(bill_system_building).length === 0) {
				alert("No data within selected datetime range.");
			} else {
				let fileName = i18n.t("Energy Usage Report");
				let blob = await pdf(
					<EnergyUsageReport
						dateFrom={dateFrom}
						dateTo={dateTo}
						lsSelectedBuilding={lsSelectedBuilding}
						lsBuilding={lsBuilding}
						kwh_system_building={kwh_system_building}
						kwhSolar={kwhSolar}
						bill_system_building={bill_system_building}
						b64PieChartBuildingEnergyUsage={b64PieChartBuildingEnergyUsage}
					/>
				).toBlob();
				saveAs(blob, fileName + ".pdf");
			}
		}

		if (isElectricityBillReportSelected) {
			let bill_building_month_year =
				await this.getElectricityBillBuildingMonthYear();
			let lsTarget = await this.getAllTargetBuildingPeriod();

			let b64BarChartBuildingElectricityBill =
				this.getB64BarChartBuildingElectricityBill(
					bill_building_month_year,
					lsBuilding
				);

			let fileName = i18n.t("Electricity Bill Report");
			let blob = await pdf(
				<ElectricityBillReport
					dateFrom={dateFrom}
					dateTo={dateTo}
					lsSelectedBuilding={lsSelectedBuilding}
					lsBuilding={lsBuilding}
					bill_building_month_year={bill_building_month_year}
					lsTarget={lsTarget}
					b64BarChartBuildingElectricityBill={
						b64BarChartBuildingElectricityBill
					}
				/>
			).toBlob();
			saveAs(blob, fileName + ".pdf");
		}

		if (isAcPowerCompareTempHumiReportSelected) {
			let fileName = i18n.t(
				"A/C Power Used Compared to Temperature and Humidity Report"
			);
			let blob = await pdf(
				<AcPowerCompareTempHumiReport
					dateFrom={dateFrom}
					dateTo={dateTo}
					lsSelectedBuilding={lsSelectedBuilding}
					lsBuilding={lsBuilding}
				/>
			).toBlob();
			saveAs(blob, fileName + ".pdf");
		}

		if (isEnergyUsePerCapitaReportSelected) {
			let fileName = i18n.t("Energy Use per Capita Report");
			let blob = await pdf(
				<EnergyUsePerCapitaReport
					dateFrom={dateFrom}
					dateTo={dateTo}
					lsSelectedBuilding={lsSelectedBuilding}
					lsBuilding={lsBuilding}
				/>
			).toBlob();
			saveAs(blob, fileName + ".pdf");
		}
	}

	getB64PieChartBuildingEnergyUsage(
		lsSelectedBuilding,
		kwh_system_building,
		lsBuilding
	) {
		let options = {
			responsive: false,
			animation: false,
			maintainAspectRatio: false,
			layout: {
				padding: { top: 10 },
			},
			plugins: {
				legend: {
					display: false,
				},
			},
		};

		let lsData = [];
		let lsColor = [];
		lsSelectedBuilding.forEach((b) => {
			lsData.push(+parseFloat(kwh_system_building[b]["Main"]).toFixed(2));
			lsColor.push(lsBuilding.find((bld) => bld.label === b).color_code);
		});

		let data = {
			labels: [...lsSelectedBuilding],
			datasets: [
				{
					data: lsData,
					backgroundColor: lsColor,
				},
			],
		};

		let dataTotal = lsData.reduce((a, b) => a + b);

		options.plugins.datalabels = {
			display: "auto",
			color: "#000000",
			anchor: function (context) {
				let idx = context.dataIndex;
				if (context.dataset.data[idx] < 20) return "end";
				return "center";
			},
			align: function (context) {
				let idx = context.dataIndex;
				if (context.dataset.data[idx] < 20) return "end";
				return "center";
			},
			font: { weight: "normal", size: 12 },
			formatter: function (value) {
				return `${Math.round((value / dataTotal) * 100)}%`;
			},
		};

		document.getElementById("pc-building-energy-usage").remove();
		document.getElementById(
			"wrapper-pc-building-energy-usage"
		).innerHTML = `<canvas id="pc-building-energy-usage" />`;

		let ctx = document
			.getElementById("pc-building-energy-usage")
			.getContext("2d");

		let chart = new Chart(ctx, {
			type: "pie",
			data: data,
			options: options,
			plugins: [ChartDataLabels],
		});

		return chart.toBase64Image();
	}

	getB64BarChartBuildingElectricityBill(bill_building_month_year, lsBuilding) {
		let options = {
			responsive: true,
			animation: false,
			maintainAspectRatio: false,
			scales: {
				x: {
					stacked: true,
					ticks: { font: { size: 12 }, color: "red" },
					title: { display: true, text: i18n.t("Month"), font: { size: 12 } },
				},
				y: {
					stacked: true,
					ticks: { font: { size: 10 } },
					title: {
						display: true,
						text: i18n.t("Electricity Bill (Baht)"),
						font: { size: 12 },
					},
					grid: { display: false },
				},
			},
			layout: {
				padding: { top: 12 },
			},
			plugins: {
				legend: { display: false },
			},
		};

		let labels = [];
		let datasets = [];
		for (let [year, bill_building_month] of Object.entries(
			bill_building_month_year
		)) {
			for (let [month, bill_building] of Object.entries(bill_building_month)) {
				labels.push(
					`${i18n.t(lsMonthFull[month])} ${
						i18n.language === "th" ? +year + 543 : year
					}`
				);

				for (let [building, bill] of Object.entries(bill_building)) {
					let dataset = datasets.find((ds) => ds.label === building);
					if (dataset === undefined) {
						dataset = {
							label: building,
							backgroundColor: lsBuilding.find((bld) => bld.label === building)
								.color_code,
							data: [],
						};

						datasets.push(dataset);
					}

					dataset.data.push(bill);
				}
			}
		}

		let data = {
			labels: labels,
			datasets: datasets,
		};

		options.plugins.datalabels = {
			display: true,
			color: "red",
			anchor: "end",
			align: "top",
			font: { weight: "normal", size: 12 },
			formatter: (value, ctx) => {
				let datasets = ctx.chart.data.datasets;
				if (ctx.datasetIndex === datasets.length - 1) {
					let sum = 0;
					datasets.map((dataset) => {
						sum += dataset.data[ctx.dataIndex];
					});
					return (
						numberFormatter.withCommas(Math.round(sum)) + ` ${i18n.t("Baht")}`
					);
				} else {
					return "";
				}
			},
		};

		document.getElementById("bc-building-bill").remove();
		document.getElementById(
			"wrapper-bc-building-bill"
		).innerHTML = `<canvas id="bc-building-bill" />`;

		let ctx = document.getElementById("bc-building-bill").getContext("2d");

		let chart = new Chart(ctx, {
			type: "bar",
			data: data,
			options: options,
			plugins: [ChartDataLabels],
		});

		return chart.toBase64Image();
	}

	render() {
		let {
			dateFrom,
			dateTo,
			lsBuilding,
			lsSelectedBuilding,
			isEnergyUsageReportSelected,
			isElectricityBillReportSelected,
			isAcPowerCompareTempHumiReportSelected,
			isEnergyUsePerCapitaReportSelected,
		} = this.state;

		const { t } = this.props;

		return (
			<div id="container-report">
				<div id="report-filter">
					{/* ******************************** Filter Pane *****************************/}
					<div id="filter-container">
						<div className="title">{t("Filter")}</div>

						{/* ****************************** Filter Form **************************** */}
						<Row className="row-form">
							<Label for="dateFrom" sm={2} className="label-datepicker">
								{t("From")}
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
									max={dateFormatter.toDateTimeString(dateTo)}
								/>
							</Col>
						</Row>
						<Row className="row-form">
							<Label for="dateTo" sm={2} className="label-datepicker">
								{t("To")}
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
									min={dateFormatter.toDateTimeString(dateFrom)}
								/>
							</Col>
						</Row>

						{/* ****************************** Building Section **************************** */}
						<div className="building-list-pane">
							<p className="heading-1">{t("Building")}</p>
							<Row className="row-building">
								<Col sm={2}>
									<Input
										type="checkbox"
										onChange={this.onClickAllBuilding}
										checked={lsSelectedBuilding.length === lsBuilding.length}
									/>
								</Col>
								<Col sm={10}>({t("All")})</Col>
							</Row>
							{lsBuilding.map((bld) => (
								<div>
									<Row className="row-building">
										<Col sm={2}>
											<Input
												type="checkbox"
												name={bld.label}
												onChange={() => this.onClickBuilding(bld.label)}
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
										<Col sm={8}>{t(`${bld.label}`)}</Col>
									</Row>
								</div>
							))}
						</div>
					</div>
				</div>
				<div id="select-report">
					<div className="heading">{t("Choose Report")}</div>
					<div className="row-report">
						<div>
							<Input
								type="checkbox"
								onChange={this.toggleEnergyUsageReport}
								checked={isEnergyUsageReportSelected}
							/>
						</div>
						{t("report.Energy Usage")}
					</div>
					<div className="row-report">
						<div>
							<Input
								type="checkbox"
								onChange={this.toggleElectricityBillReport}
								checked={isElectricityBillReportSelected}
							/>
						</div>
						{t("Electricity Bill")}
					</div>
					<div className="row-report">
						<div>
							<Input
								type="checkbox"
								onChange={this.toggleAcPowerCompareTempHumiReport}
								checked={isAcPowerCompareTempHumiReportSelected}
							/>
						</div>
						{t(
							"Air Conditioning Power Used Compared to Temperature and Humidity"
						)}
					</div>
					<div className="row-report">
						<Input
							type="checkbox"
							onChange={this.toggleEnergyUsePerCapitaReport}
							checked={isEnergyUsePerCapitaReportSelected}
						/>
						{t("Energy Use per Capita")}
					</div>
					<button onClick={this.generateReports}>
						{t("Generate Reports")}
					</button>
				</div>

				{/* ****************************** Invisible Chart Container *****************************/}
				<div id="charts-invisible">
					<div id="wrapper-pc-building-energy-usage">
						<canvas id="pc-building-energy-usage" />
					</div>
					<div id="wrapper-bc-building-bill">
						<canvas id="bc-building-bill" />
					</div>
				</div>
			</div>
		);
	}
}

export default withTranslation()(Report);
