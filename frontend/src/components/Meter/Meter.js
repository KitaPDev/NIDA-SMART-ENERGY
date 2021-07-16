import React from "react";
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
import dateFormatter from "../../util/dateFormatter";
import http from "../../util/http";
import { RiFileExcel2Fill } from "react-icons/ri";

class Meter extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isMapMode: true,
			isDiagramMode: false,
			lsDevice: [],
			lsBuilding: [],
			building: "",
			searchText: "",
			currentBuildingLabel: "",
			isOverall: true,
		};

		this.setMapMode = this.setMapMode.bind(this);
		this.setDiagramMode = this.setDiagramMode.bind(this);
		this.setBuilding = this.setBuilding.bind(this);
		this.getAllDevice = this.getAllDevice.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.toggleSortByMeterID = this.toggleSortByMeterID.bind(this);
		this.toggleSortByStatus = this.toggleSortByStatus.bind(this);
		this.getAllBuilding = this.getAllBuilding.bind(this);
	}

	componentDidMount() {
		this.getAllDevice();
		this.getAllBuilding();
	}

	setMapMode() {
		this.setState((prevState) => ({
			isMapMode: true,
			isDiagramMode: false,
		}));
	}

	setDiagramMode() {
		this.setState((prevState) => ({
			isDiagramMode: true,
			isMapMode: false,
		}));
	}

	setBuilding(building) {
		this.setState({
			building: building,
		});
	}

	handleInputChange(e) {
		this.setState({ [e.target.name]: e.target.value });
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

	async getAllBuilding() {
		try {
			let resp = await http.get("/building/all");

			this.setState({ lsBuilding: resp.data });
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	render() {
		let {
			isMapMode,
			isDiagramMode,
			searchText,
			lsDevice,
			lsBuilding,
			isSortByMeterIDAsc,
			isSortByMeterIDDesc,
			isSortByStatusActive,
			isSortByStatusInactive,
			currentBuildingLabel,
			isOverall,
		} = this.state;

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
			lsDeviceDisplay = lsDeviceDisplay.filter((device, index) => {
				return (
					device.id.includes(searchText) ||
					device.building.includes(searchText) ||
					device.location.includes(searchText) ||
					device.site.includes(searchText) ||
					device.brand_model.includes(searchText) ||
					device.system.includes(searchText) ||
					dateFormatter
						.ddmmyyyy(new Date(device.activated_timestamp))
						.includes(searchText)
				);
			});
		}

		return (
			<div className="meter">
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
						<Row className="row-map"></Row>
						<Container className="container-table-device-manager" fluid>
							<Row className="row-input">
								<Form>
									<FormGroup row className="fg-period">
										<Col sm={1} className="col-table-heading">
											General Info
										</Col>
										<Col sm={1} className="col-excel-icon">
											<RiFileExcel2Fill className="excel-icon" size={25} />
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
									{lsDeviceDisplay.map((device, index) => (
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
							<div className="building-list-pane">
								<p id="heading-1">Building</p>
								<Row
									className="row-overall"
									style={{ opacity: isOverall ? 1 : 0.5 }}
									onClick={() => this.setState({ isOverall: true })}
								>
									Overall
								</Row>
								{lsBuilding.map((bld) => (
									<div>
										<Row
											className="row-building"
											style={{
												opacity: isOverall
													? 1
													: bld.label === currentBuildingLabel
													? 1
													: 0.5,
											}}
											onClick={() =>
												this.setState({
													currentBuildingLabel: bld.label,
													isOverall: false,
												})
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
					</Row>
				)}
			</div>
		);
	}
}

export default Meter;
