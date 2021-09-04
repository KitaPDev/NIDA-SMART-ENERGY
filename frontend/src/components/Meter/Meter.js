import React from "react";

// Styling and Media
import "./Meter.css";
import {
	Button,
	Row,
	Col,
	Container,
	Form,
	FormGroup,
	Input,
	Label,
	Table,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "reactstrap";
import { IoMdSearch } from "react-icons/io";
import { ReactSVG } from "react-svg";
import { RiFileExcel2Fill } from "react-icons/ri";

// Utils
import dateFormatter from "../../utils/dateFormatter";
import http from "../../utils/http";
import csv from "../../utils/csv";

import { withTranslation } from "react-i18next";

class Meter extends React.Component {
	constructor(props) {
		super(props);

		let dateFrom = new Date(new Date().setHours(0, 0, 0, 0));
		let dateTo = new Date();

		this.state = {
			isMapMode: true,
			isDiagramMode: false,
			lsDevice: [],
			lsBuilding: [],
			lsSelectedBuilding: [],
			lsLog: [],
			building: "",
			searchText: "",
			currentBuildingLabel: "",
			isOverall: true,
			isModalOpen: false,
			modalDeviceID: "",
			dateFrom: dateFrom,
			dateTo: dateTo,
			interval: "15 min",
			buildingPath: window.location.origin + "/building/", // For Building Images
			propsPath: window.location.origin + "/props/", // For Props Images
			lsPermission: JSON.parse(localStorage.getItem("lsPermission")),
		};

		this.setMapMode = this.setMapMode.bind(this);
		this.setDiagramMode = this.setDiagramMode.bind(this);
		this.setBuilding = this.setBuilding.bind(this);

		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleInputDateChange = this.handleInputDateChange.bind(this);
		this.onClickBuilding = this.onClickBuilding.bind(this);
		this.onDoubleClickBuilding = this.onDoubleClickBuilding.bind(this);
		this.onClickAllBuilding = this.onClickAllBuilding.bind(this);
		this.toggleSortByMeterID = this.toggleSortByMeterID.bind(this);
		this.toggleSortByStatus = this.toggleSortByStatus.bind(this);
		this.toggleModalOpen = this.toggleModalOpen.bind(this);

		this.getAllDevice = this.getAllDevice.bind(this);
		this.getAllBuilding = this.getAllBuilding.bind(this);
		this.getAllDeviceLatestLog = this.getAllDeviceLatestLog.bind(this);
		this.getExportData = this.getExportData.bind(this);

		this.exportTable = this.exportTable.bind(this);
		this.exportMeter = this.exportMeter.bind(this);
	}

	componentDidMount() {
		this.getAllDevice();
		this.getAllBuilding();
		this.getAllDeviceLatestLog();

		this.intervalDeviceLog = setInterval(
			() => this.getAllDeviceLatestLog(),
			300000
		);
	}
	componentWillUnmount() {
		clearInterval(this.intervalDeviceLog);
	}

	setMapMode() {
		this.setState({
			isMapMode: true,
			isDiagramMode: false,
		});
	}

	setDiagramMode() {
		let { lsSelectedBuilding } = this.state;
		if (lsSelectedBuilding.length > 1) this.onClickAllBuilding();

		this.setState({
			isDiagramMode: true,
			isMapMode: false,
		});
	}

	setBuilding(building) {
		this.setState({
			building: building,
		});
	}

	handleInputChange(e) {
		this.setState({ [e.target.name]: e.target.value });
	}

	handleInputDateChange(e) {
		this.setState({ [e.target.name]: new Date(e.target.value) });
	}

	onClickBuilding(building) {
		let { lsSelectedBuilding, lsBuilding, isDiagramMode } = this.state;

		if (lsSelectedBuilding.length === lsBuilding.length || isDiagramMode) {
			lsSelectedBuilding = [building];
		} else if (!lsSelectedBuilding.includes(building)) {
			lsSelectedBuilding.push(building);
			this.setState({ lsSelectedBuilding: lsSelectedBuilding });
		} else {
			lsSelectedBuilding = lsSelectedBuilding.filter((b) => b !== building);
		}

		this.setState({ lsSelectedBuilding: lsSelectedBuilding });
	}

	onDoubleClickBuilding(building) {
		this.setState({
			isMapMode: false,
			isDiagramMode: true,
			lsSelectedBuilding: [building],
		});
	}

	onClickAllBuilding() {
		let { lsSelectedBuilding, lsBuilding } = this.state;
		lsSelectedBuilding = lsBuilding.map((building) => building.label);
		this.setState({ lsSelectedBuilding: lsSelectedBuilding });
	}

	toggleSortByMeterID() {
		let { isSortByMeterIDAsc, isSortByMeterIDDesc } = this.state;

		if (!(isSortByMeterIDAsc || isSortByMeterIDDesc)) {
			this.setState({
				isSortByMeterIDAsc: true,
				isSortByMeterIDDesc: false,
				isSortByStatusActive: false,
				isSortByStatusInactive: false,
			});
		} else if (isSortByMeterIDAsc) {
			this.setState({
				isSortByMeterIDAsc: false,
				isSortByMeterIDDesc: true,
				isSortByStatusActive: false,
				isSortByStatusInactive: false,
			});
		} else if (isSortByMeterIDDesc) {
			this.setState({
				isSortByMeterIDAsc: true,
				isSortByMeterIDDesc: false,
				isSortByStatusActive: false,
				isSortByStatusInactive: false,
			});
		}
	}

	toggleSortByStatus() {
		let { isSortByStatusActive, isSortByStatusInactive } = this.state;

		if (!(isSortByStatusActive || isSortByStatusInactive)) {
			this.setState({
				isSortByStatusActive: true,
				isSortByStatusInactive: false,
				isSortByMeterIDAsc: false,
				isSortByMeterIDDesc: false,
			});
		} else if (isSortByStatusActive) {
			this.setState({
				isSortByStatusActive: false,
				isSortByStatusInactive: true,
				isSortByMeterIDAsc: false,
				isSortByMeterIDDesc: false,
			});
		} else if (isSortByStatusInactive) {
			this.setState({
				isSortByStatusActive: true,
				isSortByStatusInactive: false,
				isSortByMeterIDAsc: false,
				isSortByMeterIDDesc: false,
			});
		}
	}

	toggleModalOpen(deviceID) {
		this.setState((prevState) => ({
			isModalOpen: !prevState.isModalOpen,
			modalDeviceID: deviceID,
		}));
	}

	async getAllDevice() {
		try {
			let resp = await http.get("/device/all");

			this.setState({ lsDevice: resp.data });
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

	async getAllDeviceLatestLog() {
		try {
			let resp = await http.get("/device/all/latest");

			this.setState({ lsLog: resp.data });
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async getExportData() {
		let { dateFrom, dateTo, interval, modalDeviceID } = this.state;

		dateFrom.setHours(0);
		dateFrom.setMinutes(0);
		dateFrom.setSeconds(0);

		dateTo.setHours(23);
		dateTo.setMinutes(59);
		dateTo.setSeconds(59);

		try {
			let payload = {
				date_from: dateFrom,
				date_to: dateTo,
				interval: interval,
				device_id: modalDeviceID,
			};

			let resp = await http.post("/device/export", payload);

			return resp.data;
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	exportTable() {
		let rows = [];
		let tableRows = document.querySelectorAll("table tr");

		for (let i = 0; i < tableRows.length; i++) {
			let row = [];
			let cols = tableRows[i].querySelectorAll("td, th");

			for (let j = 0; j < cols.length; j++) {
				row.push(cols[j].innerText);
			}

			rows.push(row);
		}

		csv.exportFile("Meter Table", rows);
	}

	async exportMeter() {
		let lsLog = await this.getExportData();

		console.log(lsLog);

		let rows = [[]];
		rows[0].push(
			"Datetime",
			"Energy (kWh)",
			"Total Power (kW)",
			"Total Apparent (kVA)",
			"Power Factor: PF",
			"Phase Voltage L1: V1 (V)",
			"Phase Voltage L2: V2 (V)",
			"Phase Voltage L3: V3 (V)",
			"Line Voltage L1-L2 (V)",
			"Line Voltage L2-L3 (V)",
			"Line Voltage L3-L1 (V)",
			"Reactive L1 (KVar)",
			"Reactive L2 (KVar)",
			"Reactive L3 (KVar)",
			"Current L1: I1 (A)",
			"Current L2: I2 (A)",
			"Current L3: I3 (A)",
			"Power L1 (kW)",
			"Power L2 (kW)",
			"Power L3 (kW)",
			"Apparent L1 (kVA)",
			"Apparent L2 (kVA)",
			"Apparent L3 (kVA)",
			"Frequency (Hz)"
		);

		for (let [idx, log] of lsLog.entries()) {
			if (rows[idx + 1] === undefined) rows[idx + 1] = [];

			rows[idx + 1].push(
				dateFormatter.yyyymmddhhmmss_noOffset(new Date(log.data_datetime)),
				log.kwh,
				log.kw_total,
				log.kva_total,
				log.pf,
				log.voltage_l1_N,
				log.voltage_l2_N,
				log.voltage_l3_N,
				log.voltage_l1_l2,
				log.voltage_l2_l3,
				log.voltage_l3_l1,
				log.kvar_l1,
				log.kvar_l2,
				log.kvar_l3,
				log.current_l1,
				log.current_l2,
				log.current_l3,
				log.kw_l1,
				log.kw_l2,
				log.k2_l3,
				log.kva_l1,
				log.kva_l2,
				log.kva_l3,
				log.hz
			);
		}

		csv.exportFile(`${this.state.modalDeviceID}`, rows);
	}

	render() {
		let {
			isMapMode,
			isDiagramMode,
			searchText,
			lsDevice,
			lsBuilding,
			lsSelectedBuilding,
			lsLog,
			isSortByMeterIDAsc,
			isSortByMeterIDDesc,
			isSortByStatusActive,
			isSortByStatusInactive,
			propsPath,
			buildingPath,
			isModalOpen,
			modalDeviceID,
			dateTo,
			dateFrom,
			interval,
			lsPermission,
		} = this.state;

		const { t } = this.props;

		if (lsSelectedBuilding.length === 0) {
			lsSelectedBuilding = lsBuilding.map((building) => building.label);
		}

		let lsDeviceDisplay = lsDevice.slice();

		if (isSortByMeterIDAsc) {
			lsDeviceDisplay.sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
		} else if (isSortByMeterIDDesc) {
			lsDeviceDisplay.sort((a, b) => (a.id > b.id ? -1 : b.id > a.id ? 1 : 0));
		} else if (isSortByStatusActive) {
			lsDeviceDisplay.sort((a, b) => (a.is_active ? -1 : !a.is_active ? 1 : 0));
		} else if (isSortByStatusInactive) {
			lsDeviceDisplay.sort((a, b) => (!a.is_active ? -1 : a.is_active ? 1 : 0));
		}

		if (searchText.length > 0) {
			lsDeviceDisplay = lsDeviceDisplay.filter((device, _) => {
				let id = device.id === null ? "" : device.id;
				let building = device.building === null ? "" : device.building;
				let location = device.location === null ? "" : device.location;
				let site = device.site === null ? "" : device.site;
				let brandModel = device.brand_model === null ? "" : device.brand_model;
				let system = device.system === null ? "" : device.system;

				return (
					id.includes(searchText) ||
					t(building).includes(searchText) ||
					location.includes(searchText) ||
					site.includes(searchText) ||
					brandModel.includes(searchText) ||
					t(system).includes(searchText) ||
					dateFormatter
						.ddmmyyyy(new Date(device.activated_datetime))
						.includes(searchText)
				);
			});
		}

		lsDeviceDisplay = lsDeviceDisplay.filter(
			(device, _) =>
				lsSelectedBuilding.includes(device.building) &&
				(device.system === "Main" || device.system === "Air Conditioner")
		);

		let latestTime = new Date(0);
		let kw_building = {};
		let kwTotal = 0;
		for (let log of lsLog) {
			let datetime = new Date(log.data_datetime);
			if (datetime.getTime() > latestTime.getTime()) latestTime = datetime;

			if (log.system === "Main" && log.floor === null) {
				let building = log.building;
				let kw = log.kw_total === null ? 0 : log.kw_total;

				if (!kw_building[building]) kw_building[building] = 0;
				kw_building[building] += kw;

				kwTotal += kw;
			}
		}

		lsLog.sort((a, b) => a.floor - b.floor);

		let modalDevice = lsDeviceDisplay.find(
			(device) => device.id === modalDeviceID
		);
		let modalLog = lsLog.find((log) => log.device_id === modalDeviceID);

		return (
			<div id="container-meter">
				{lsBuilding.map((building) => (
					<style>
						{`#img-${building.label
							.toLowerCase()
							.replace(" ", "-")} polygon[class^="st"],
							#img-${building.label.toLowerCase().replace(" ", "-")} path[class^="st"],
							#img-${building.label.toLowerCase().replace(" ", "-")} rect[class^="st"]{
								fill: ${
									lsSelectedBuilding.includes(building.label)
										? building.color_code
										: "#d1dbde"
								}
							}`}
					</style>
				))}
				<Row className="row-btn-mode">
					<Button
						className="btn-map"
						active={isMapMode}
						onClick={this.setMapMode}
					>
						{t("Map")}
					</Button>
					<Button
						className="btn-diagram"
						active={isDiagramMode}
						onClick={this.setDiagramMode}
					>
						{t("Diagram")}
					</Button>
				</Row>
				{isMapMode ? (
					<div className="meter-map">
						<div className="map-campus">
							<div className="row-building-block">
								{lsBuilding.map((building) => (
									<div
										className="building-block"
										style={{
											backgroundColor: lsSelectedBuilding.includes(
												building.label
											)
												? building.color_code
												: "#d1dbde",
											color: lsSelectedBuilding.includes(building.label)
												? "#fff"
												: "#000",
										}}
										onClick={() => this.onClickBuilding(building.label)}
										onDoubleClick={() =>
											this.onDoubleClickBuilding(building.label)
										}
									>
										{t(`${building.label}`)}
									</div>
								))}
							</div>
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
								<ReactSVG
									afterInjection={(error) => {
										if (error) {
											console.log(error);
											return;
										}
									}}
									id={"img-" + building.label.toLowerCase().replace(" ", "-")}
									className={"img-building"}
									src={
										buildingPath +
										building.label +
										"/" +
										building.label +
										".svg"
									}
									wrapper="div"
								/>
							))}
						</div>
						<Row className="row-input">
							<Form>
								<FormGroup row>
									<Col sm={1} className="col-table-heading">
										{t("General Info")}
									</Col>
									<Col sm={1} className="col-excel-icon">
										{lsPermission.find(
											(p) => p.label === "Export Information"
										) ? (
											<RiFileExcel2Fill
												className="icon-excel"
												size={25}
												onClick={this.exportTable}
											/>
										) : (
											<></>
										)}
									</Col>
									<Input
										type="text"
										name="searchText"
										id="searchText"
										value={searchText}
										onChange={this.handleInputChange}
									/>
									<span className="span-search-icon">
										<IoMdSearch size={25} />
									</span>
								</FormGroup>
							</Form>
						</Row>
						<Container className="container-table-device-manager" fluid>
							<Table className="table-device-manager">
								<thead className="device-table-head">
									<tr>
										<th
											className={
												isSortByMeterIDAsc
													? "sort_asc"
													: isSortByMeterIDDesc
													? "sort_desc"
													: "sort"
											}
											onClick={this.toggleSortByMeterID}
										>
											{t("Meter") + " ID"}
										</th>
										<th>{t("Building")}</th>
										<th>{t("Floor")}</th>
										<th>{t("Location")}</th>
										<th>{t("Site")}</th>
										<th>{t("Brand / Model")}</th>
										<th>{t("System")}</th>
										<th
											className={
												isSortByStatusActive
													? "sort_asc"
													: isSortByStatusInactive
													? "sort_desc"
													: "sort"
											}
											onClick={this.toggleSortByStatus}
										>
											{t("Status")}
										</th>

										<th>{t("Activated Date")}</th>
										<th></th>
										<th></th>
									</tr>
								</thead>
								<tbody>
									{lsDeviceDisplay.map((device, _) => (
										<tr>
											<td>{device.id}</td>
											<td>{t(`${device.building}`)}</td>
											<td>{device.floor}</td>
											<td>{device.location}</td>
											<td>{device.site}</td>
											<td>{device.brand_model}</td>
											<td>{t(`${device.system}`)}</td>
											<td>
												<span
													className={device.is_active ? "green-dot" : "red-dot"}
												></span>
											</td>
											<td>
												{dateFormatter.ddmmyyyy(
													new Date(device.activated_datetime)
												)}
											</td>
										</tr>
									))}
								</tbody>
							</Table>
						</Container>
					</div>
				) : (
					<Row className="row-diagram">
						<Col sm={2}>
							<div class="building-list-pane">
								<p class="heading-1">{t("Building")}</p>
								<Row
									className="row-building"
									style={{ justifyContent: "center" }}
									onClick={this.onClickAllBuilding}
								>
									{t("Overall")}
								</Row>
								{lsBuilding.map((bld) => (
									<div>
										<Row
											className="row-building"
											style={{
												opacity: lsSelectedBuilding.includes(bld.label)
													? 1
													: 0.5,
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
											<Col sm={10}>{t(`${bld.label}`)}</Col>
										</Row>
									</div>
								))}
							</div>
						</Col>
						<Col sm={10} className="col-right">
							{lsSelectedBuilding.length === lsBuilding.length ? (
								<>
									<Row className="row-title" style={{ textTransform: "none" }}>
										{t("time")}{" "}
										<span className="latest-time">
											{latestTime.toTimeString().split(" ")[0].substring(0, 5)}
										</span>
									</Row>
									<Row className="row-title">
										{t("NIDA")}{" "}
										<span className="kw-total">
											{parseFloat(kwTotal).toFixed(2) + " kW"}
										</span>
									</Row>
									<div className="meter-buildings">
										{lsBuilding.map((bld) => (
											<div className="meter-building">
												<div className="meter">
													<img
														src={window.location.origin + "/meter.png"}
														alt="meter.png"
													/>
												</div>
												<div className="info">
													<div
														className="label"
														style={{ backgroundColor: bld.color_code }}
														onClick={() => this.onClickBuilding(bld.label)}
													>
														{t(`${bld.label}`)}
													</div>
													<div className="kw">
														{kw_building[bld.label] === undefined
															? "N/A"
															: parseFloat(kw_building[bld.label]).toFixed(2) +
															  " kW"}
													</div>
												</div>
											</div>
										))}
									</div>
								</>
							) : (
								<>
									<div className="row-meter-main">
										{lsLog.map((log) => (
											<>
												{lsDeviceDisplay.find(
													(device) => device.id === log.device_id
												) === undefined ||
												log.system !== "Main" ||
												log.floor !== null ? (
													<></>
												) : (
													<div
														className="meter-main"
														onClick={() => this.toggleModalOpen(log.device_id)}
													>
														<div className="meter">
															<img
																src={window.location.origin + "/meter.png"}
															/>
														</div>

														<div className="info">
															<div className="label">{log.device_id}</div>
															<div className="kw">({log.kw_total + " kW"})</div>
														</div>
														<div className="status">
															<div
																className={
																	lsDeviceDisplay.filter(
																		(device) => device.id === log.device_id
																	)[0]
																		? lsDeviceDisplay.filter(
																				(device) => device.id === log.device_id
																		  )[0].is_active
																			? "green-dot"
																			: "red-dot"
																		: "red-dot"
																}
															></div>
														</div>
													</div>
												)}
											</>
										))}
									</div>

									<div className="container-table">
										<table className="table-ac">
											<thead>
												<tr>
													<th>{t("Air Handling Unit")}</th>
												</tr>
											</thead>
											<div className="tbody">
												<tbody>
													{lsLog.map((log) => (
														<>
															{lsDeviceDisplay.find(
																(device) => device.id === log.device_id
															) === undefined ||
															log.system !== "Air Conditioner" ||
															log.floor === null ? (
																<></>
															) : (
																<tr key={log.device_id}>
																	<td>
																		<div
																			className="meter-system"
																			onClick={() =>
																				this.toggleModalOpen(log.device_id)
																			}
																		>
																			<div className="meter">
																				<img
																					src={
																						window.location.origin +
																						"/meter.png"
																					}
																				/>
																			</div>

																			<div className="info">
																				<div className="label-top">
																					{log.device_id}
																				</div>
																				<div className="label-bottom">
																					(
																					{log.kw_total === null
																						? "N/A"
																						: parseFloat(log.kw_total).toFixed(
																								2
																						  ) + " kW"}
																					){` - ${t("Floor")} `}
																					{log.floor === null
																						? "N/A"
																						: log.floor < 0
																						? log.floor
																								.toString()
																								.replace("-", "B")
																						: log.floor}
																				</div>
																			</div>

																			<div className="status">
																				<div
																					className={
																						lsDeviceDisplay.filter(
																							(device) =>
																								device.id === log.device_id
																						)[0]
																							? lsDeviceDisplay.filter(
																									(device) =>
																										device.id === log.device_id
																							  )[0].is_active
																								? "green-dot"
																								: "red-dot"
																							: "red-dot"
																					}
																				></div>
																			</div>
																		</div>
																	</td>
																</tr>
															)}
														</>
													))}
												</tbody>
											</div>
										</table>

										<table className="table-others">
											<thead>
												<tr>
													<th>{t("Others")}</th>
												</tr>
											</thead>
											<div className="tbody">
												<tbody>
													{lsLog.map((log) => (
														<>
															{lsDeviceDisplay.find(
																(device) => device.id === log.device_id
															) === undefined ||
															log.system !== "Main" ||
															log.floor === null ? (
																<></>
															) : (
																<tr key={log.device_id}>
																	<td>
																		<div
																			className="meter-system"
																			onClick={() =>
																				this.toggleModalOpen(log.device_id)
																			}
																		>
																			<div className="meter">
																				<img
																					src={
																						window.location.origin +
																						"/meter.png"
																					}
																				/>
																			</div>

																			<div className="info">
																				<div className="label-top">
																					{log.device_id}
																				</div>
																				<div className="label-bottom">
																					(
																					{log.kw_total === null
																						? "N/A"
																						: parseFloat(log.kw_total).toFixed(
																								2
																						  ) + " kW"}
																					){` - ${t("Floor")} `}
																					{log.floor === null
																						? "N/A"
																						: log.floor < 0
																						? log.floor
																								.toString()
																								.replace("-", "B")
																						: log.floor}
																				</div>
																			</div>

																			<div className="status">
																				<div
																					className={
																						lsDeviceDisplay.filter(
																							(device) =>
																								device.id === log.device_id
																						)[0]
																							? lsDeviceDisplay.filter(
																									(device) =>
																										device.id === log.device_id
																							  )[0].is_active
																								? "green-dot"
																								: "red-dot"
																							: "red-dot"
																					}
																				></div>
																			</div>
																		</div>
																	</td>
																</tr>
															)}
														</>
													))}
												</tbody>
											</div>
										</table>
									</div>
								</>
							)}
						</Col>
					</Row>
				)}
				<Modal
					size="lg"
					isOpen={isModalOpen}
					toggle={() => this.toggleModalOpen("")}
					className="modal-meter"
				>
					<ModalHeader toggle={() => this.toggleModalOpen("")}>
						<div className="modal-title-content">
							<div className="status">
								{modalDevice ? (
									modalDevice.is_active ? (
										<div className="green-dot" />
									) : (
										<div className="red-dot" />
									)
								) : (
									<div className="red-dot" />
								)}
							</div>
							{modalDeviceID + " "}
							<span className="brand-model">
								{modalDevice
									? modalDevice.brand_model !== null
										? modalDevice.brand_model
										: "N/A"
									: "N/A"}
							</span>
						</div>
					</ModalHeader>
					<ModalBody>
						<div className="body-row-1">
							<div className="meter-img">
								<img src={window.location.origin + "/meter.png"} />
							</div>
							<table>
								<tbody>
									<tr>
										<td>{t("Energy")} (kWh)</td>
										<td>
											{modalLog
												? modalLog.kwh !== null
													? modalLog.kwh
													: "N/A"
												: "N/A"}
										</td>
									</tr>
									<tr>
										<td>{t("Total Power")} (kW)</td>
										<td>
											{modalLog
												? modalLog.kw_total !== null
													? modalLog.kw_total
													: "N/A"
												: "N/A"}
										</td>
									</tr>
									<tr>
										<td>{t("Total Apparent")} (kVA)</td>
										<td>
											{modalLog
												? modalLog.kva_total !== null
													? modalLog.kva_total
													: "N/A"
												: "N/A"}
										</td>
									</tr>
									<tr>
										<td>{t("Power Factor")}: PF</td>
										<td>
											{modalLog
												? modalLog.pf !== null
													? modalLog.pf
													: "N/A"
												: "N/A"}
										</td>
									</tr>
								</tbody>
							</table>
						</div>

						<div className="body-row-2">
							<table>
								<tbody>
									<tr>
										<td>{t("Phase Voltage")} L1: V1 (V)</td>
										<td>
											{modalLog
												? modalLog.voltage_l1_N !== null
													? modalLog.voltage_l1_N
													: "N/A"
												: "N/A"}
										</td>
										<td>{t("Current")} L1: I1 (A)</td>
										<td>
											{modalLog
												? modalLog.current_l1 !== null
													? modalLog.current_l1
													: "N/A"
												: "N/A"}
										</td>
									</tr>

									<tr>
										<td>{t("Phase Voltage")} L2: V2 (V)</td>
										<td>
											{modalLog
												? modalLog.voltage_l2_N !== null
													? modalLog.voltage_l2_N
													: "N/A"
												: "N/A"}
										</td>
										<td>{t("Current")} L2: I2 (A)</td>
										<td>
											{modalLog
												? modalLog.current_l2 !== null
													? modalLog.current_l2
													: "N/A"
												: "N/A"}
										</td>
									</tr>

									<tr>
										<td>{t("Phase Voltage")} L3: V3 (V)</td>
										<td>
											{modalLog
												? modalLog.voltage_l3_N !== null
													? modalLog.voltage_l3_N
													: "N/A"
												: "N/A"}
										</td>
										<td>{t("Current")} L3: I3 (A)</td>
										<td>
											{modalLog
												? modalLog.current_l3 !== null
													? modalLog.current_l3
													: "N/A"
												: "N/A"}
										</td>
									</tr>

									<tr className="spacer"></tr>

									<tr>
										<td>{t("Line Voltage")} L1-L2 (V)</td>
										<td>
											{modalLog
												? modalLog.voltage_l1_l2 !== null
													? modalLog.voltage_l1_l2
													: "N/A"
												: "N/A"}
										</td>
										<td>{t("Power")} L1 (kW)</td>
										<td>
											{modalLog
												? modalLog.kw_l1 !== null
													? modalLog.kw_l1
													: "N/A"
												: "N/A"}
										</td>
									</tr>

									<tr>
										<td>{t("Line Voltage")} L2-L3 (V)</td>
										<td>
											{modalLog
												? modalLog.voltage_l2_l3 !== null
													? modalLog.voltage_l2_l3
													: "N/A"
												: "N/A"}
										</td>
										<td>{t("Power")} L2 (kW)</td>
										<td>
											{modalLog
												? modalLog.kw_l2 !== null
													? modalLog.kw_l2
													: "N/A"
												: "N/A"}
										</td>
									</tr>

									<tr>
										<td>{t("Line Voltage")} L3-L1 (V)</td>
										<td>
											{modalLog
												? modalLog.voltage_l3_l1 !== null
													? modalLog.voltage_l3_l1
													: "N/A"
												: "N/A"}
										</td>
										<td>{t("Power")} L3 (kW)</td>
										<td>
											{modalLog
												? modalLog.kw_l3 !== null
													? modalLog.kw_l3
													: "N/A"
												: "N/A"}
										</td>
									</tr>

									<tr className="spacer"></tr>

									<tr>
										<td>{t("Reactive")} L1 (KVar)</td>
										<td>
											{modalLog
												? modalLog.kvar_l1 !== null
													? modalLog.kvar_l1
													: "N/A"
												: "N/A"}
										</td>
										<td>{t("Apparent")} L1 (kVA)</td>
										<td>
											{modalLog
												? modalLog.kva_l1 !== null
													? modalLog.kva_l1
													: "N/A"
												: "N/A"}
										</td>
									</tr>

									<tr>
										<td>{t("Reactive")} L2 (KVar)</td>
										<td>
											{modalLog
												? modalLog.kvar_l2 !== null
													? modalLog.kvar_l2
													: "N/A"
												: "N/A"}
										</td>
										<td>{t("Apparent")} L2 (kVA)</td>
										<td>
											{modalLog
												? modalLog.kva_l2 !== null
													? modalLog.kva_l2
													: "N/A"
												: "N/A"}
										</td>
									</tr>

									<tr>
										<td>{t("Reactive")} L3 (KVar)</td>
										<td>
											{modalLog
												? modalLog.kvar_l3 !== null
													? modalLog.kvar_l3
													: "N/A"
												: "N/A"}
										</td>
										<td>{t("Apparent")} L3 (kVA)</td>
										<td>
											{modalLog
												? modalLog.kva_l3 !== null
													? modalLog.kva_l3
													: "N/A"
												: "N/A"}
										</td>
									</tr>

									<tr className="spacer"></tr>

									<tr>
										<td>{t("Frequency")} (Hz)</td>
										<td>
											{modalLog
												? modalLog.hz !== null
													? modalLog.hz
													: "N/A"
												: "N/A"}
										</td>
										<td></td>
										<td></td>
									</tr>
								</tbody>
							</table>
						</div>
					</ModalBody>
					<ModalFooter>
						<div className="footer-row-1">
							<span>{t("Select date to export")}</span>{" "}
							{lsPermission.find((p) => p.label === "Export Information") ? (
								<RiFileExcel2Fill
									className="icon-excel"
									size={30}
									onClick={this.exportMeter}
								/>
							) : (
								<></>
							)}
						</div>
						<form>
							<Label for="dateFrom">{t("From")}</Label>
							<div>
								<Input
									className="datepicker"
									type="date"
									name="dateFrom"
									id="dateFrom"
									placeholder="datetime placeholder"
									value={dateFormatter.yyyymmdd_noOffset(dateFrom)}
									onChange={this.handleInputDateChange}
									max={dateFormatter.yyyymmdd_noOffset(dateTo)}
								/>
							</div>
							<Label for="dateTo">{t("To")}</Label>
							<div>
								<Input
									className="datepicker"
									type="date"
									name="dateTo"
									id="dateTo"
									placeholder="datetime placeholder"
									value={dateFormatter.yyyymmdd_noOffset(dateTo)}
									onChange={this.handleInputDateChange}
									min={dateFormatter.yyyymmdd_noOffset(dateFrom)}
								/>
							</div>
							<Label for="interval" className="label-interval">
								{t("Interval")}
							</Label>
							<div className="col-input-interval">
								<Input
									type="select"
									name="interval"
									id="interval"
									value={interval}
									onChange={this.handleInputChange}
								>
									<option>15 {t("min")}</option>
									<option>30 {t("min")}</option>
									<option>1 {t("hour")}</option>
									<option>1 {t("day")}</option>
								</Input>
							</div>
						</form>
					</ModalFooter>
				</Modal>
			</div>
		);
	}
}

export default withTranslation()(Meter);
