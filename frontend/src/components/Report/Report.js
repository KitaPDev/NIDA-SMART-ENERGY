import React from "react";

import "./Report.css";
import { Row, Col, Label, Input } from "reactstrap";

import http from "../../utils/http";
import dateFormatter from "../../utils/dateFormatter";

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
			kwh_system_building: {},
			lsKw_system_building: {},
			bill_building: {},
			tariff_building: {},
			targetBill_building: {},
			kwhSolar: 0,
			compareTo: "Target",
			lsTempHumi: [],
			billData_month: {},
			lsPermission: JSON.parse(localStorage.getItem("lsPermission")),
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

		this.generateReports = this.generateReports.bind(this);
	}

	componentDidMount() {
		this.getAllBuilding();
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

	async generateReports() {
		let {
			isEnergyUsageReportSelected,
			isElectricityBillReportSelected,
			isAcPowerCompareTempHumiReportSelected,
			isEnergyUsePerCapitaReportSelected,
		} = this.state;

		if (isEnergyUsageReportSelected) {
			let fileName = i18n.t("Energy Usage Report");
			let blob = await pdf(<EnergyUsageReport />).toBlob();
			saveAs(blob, fileName + ".pdf");
		}

		if (isElectricityBillReportSelected) {
			let fileName = i18n.t("Electricity Bill Report");
			let blob = await pdf(<ElectricityBillReport />).toBlob();
			saveAs(blob, fileName + ".pdf");
		}

		if (isAcPowerCompareTempHumiReportSelected) {
			let fileName = i18n.t(
				"Air Conditioning Power Used Compared to Temperature and Humidity Report"
			);
			let blob = await pdf(<AcPowerCompareTempHumiReport />).toBlob();
			saveAs(blob, fileName + ".pdf");
		}

		if (isEnergyUsePerCapitaReportSelected) {
			let fileName = i18n.t("Energy Use per Capita Report");
			let blob = await pdf(<EnergyUsePerCapitaReport />).toBlob();
			saveAs(blob, fileName + ".pdf");
		}
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
			</div>
		);
	}
}

export default withTranslation()(Report);
