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
	Table,
} from "reactstrap";
import { IoMdSearch } from "react-icons/io";
import { ReactSVG } from "react-svg";
import { RiFileExcel2Fill } from "react-icons/ri";

// Utils
import dateFormatter from "../../utils/dateFormatter";
import http from "../../utils/http";
import csv from "../../utils/csv";

class Meter extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isMapMode: true,
			isDiagramMode: false,
			lsDevice: [],
			lsBuilding: [],
			lsSelectedBuilding: [],
			building: "",
			searchText: "",
			currentBuildingLabel: "",
			isOverall: true,
			buildingPath: window.location.origin + "/building/", // For Building Images
			propsPath: window.location.origin + "/props/", // For Props Images
		};

		this.setMapMode = this.setMapMode.bind(this);
		this.setDiagramMode = this.setDiagramMode.bind(this);
		this.setBuilding = this.setBuilding.bind(this);

		this.handleInputChange = this.handleInputChange.bind(this);
		this.onClickBuilding = this.onClickBuilding.bind(this);
		this.onDoubleClickBuilding = this.onDoubleClickBuilding.bind(this);
		this.onClickAllBuilding = this.onClickAllBuilding.bind(this);
		this.toggleSortByMeterID = this.toggleSortByMeterID.bind(this);
		this.toggleSortByStatus = this.toggleSortByStatus.bind(this);

		this.getAllDevice = this.getAllDevice.bind(this);
		this.getAllBuilding = this.getAllBuilding.bind(this);

		this.exportTable = this.exportTable.bind(this);
	}

	componentDidMount() {
		this.getAllDevice();
		this.getAllBuilding();
	}

	setMapMode() {
		this.setState({
			isMapMode: true,
			isDiagramMode: false,
		});
	}

	setDiagramMode() {
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

	render() {
		let {
			isMapMode,
			isDiagramMode,
			searchText,
			lsDevice,
			lsBuilding,
			lsSelectedBuilding,
			isSortByMeterIDAsc,
			isSortByMeterIDDesc,
			isSortByStatusActive,
			isSortByStatusInactive,
			currentBuildingLabel,
			isOverall,
			propsPath,
			buildingPath,
		} = this.state;

		if (lsSelectedBuilding.length === 0) {
			lsSelectedBuilding = lsBuilding.map((building) => building.label);
		}

		let lsDeviceDisplay = lsDevice.slice();

		if (isSortByMeterIDAsc) {
			lsDeviceDisplay.sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
		} else if (isSortByMeterIDDesc) {
			lsDeviceDisplay.sort((a, b) => (a.id > b.id ? -1 : b.id > a.id ? 1 : 0));
		} else if (isSortByStatusActive) {
			lsDeviceDisplay.sort((a, b) =>
				a.is_active === 1 ? -1 : a.is_active === 0 ? 1 : 0
			);
		} else if (isSortByStatusInactive) {
			lsDeviceDisplay.sort((a, b) =>
				a.is_active === 0 ? -1 : a.is_active === 1 ? 1 : 0
			);
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
					building.includes(searchText) ||
					location.includes(searchText) ||
					site.includes(searchText) ||
					brandModel.includes(searchText) ||
					system.includes(searchText) ||
					dateFormatter
						.ddmmyyyy(new Date(device.activated_timestamp))
						.includes(searchText)
				);
			});
		}

		lsDeviceDisplay = lsDeviceDisplay.filter((device, _) =>
			lsSelectedBuilding.includes(device.building)
		);

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
						Map
					</Button>
					<Button
						className="btn-diagram"
						active={isDiagramMode}
						onClick={this.setDiagramMode}
					>
						Diagram
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
										{building.label}
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
								<FormGroup row className="fg-period">
									<Col sm={1} className="col-table-heading">
										General Info
									</Col>
									<Col sm={1} className="col-excel-icon">
										<RiFileExcel2Fill
											className="icon-excel"
											size={25}
											onClick={this.exportTable}
										/>
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
											Meter ID
										</th>
										<th>Building</th>
										<th>Floor</th>
										<th>Location</th>
										<th>Site</th>
										<th>Brand / Model</th>
										<th>System</th>
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
											Status
										</th>

										<th>Activated Date</th>
										<th></th>
										<th></th>
									</tr>
								</thead>
								<tbody>
									{lsDeviceDisplay.map((device, _) => (
										<tr>
											<td>{device.id}</td>
											<td>{device.building}</td>
											<td>{device.floor}</td>
											<td>{device.location}</td>
											<td>{device.site}</td>
											<td>{device.brand_model}</td>
											<td>{device.system}</td>
											<td>
												<span
													className={
														device.is_active === 1 ? "green-dot" : "red-dot"
													}
												></span>
											</td>
											<td>
												{dateFormatter.ddmmyyyy(
													new Date(device.activated_timestamp)
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
								<p class="heading-1">Building</p>
								<Row
									className="row-building"
									style={{ justifyContent: "center" }}
									onClick={this.onClickAllBuilding}
								>
									Overall
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
											<Col sm={10}>{bld.label}</Col>
										</Row>
									</div>
								))}
							</div>
						</Col>
						<Col sm={10}>
							<Row className="row-title" style={{ textTransform: "none" }}>
								Time
							</Row>
							<Row className="row-title">NIDA</Row>
						</Col>
					</Row>
				)}
			</div>
		);
	}
}

export default Meter;
