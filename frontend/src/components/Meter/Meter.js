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
import http from "../../util/httpService";

class Meter extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isMapMode: true,
			isDiagramMode: false,
			lsDevice: [],
			building: "",
			searchText: "",
		};

		this.setMapMode = this.setMapMode.bind(this);
		this.setDiagramMode = this.setDiagramMode.bind(this);
		this.setBuilding = this.setBuilding.bind(this);
		this.getAllDevice = this.getAllDevice.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.toggleSortByMeterID = this.toggleSortByMeterID.bind(this);
		this.toggleSortByStatus = this.toggleSortByStatus.bind(this);
	}

	componentDidMount() {
		this.getAllDevice();
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

	render() {
		let {
			isMapMode,
			isDiagramMode,
			searchText,
			lsDevice,
			isSortByMeterIDAsc,
			isSortByMeterIDDesc,
			isSortByStatusActive,
			isSortByStatusInactive,
		} = this.state;

		let lsDeviceDisplay = lsDevice.slice();

		if (isSortByMeterIDAsc) {
			lsDeviceDisplay.sort((a, b) =>
				a.meter_id > b.meter_id ? 1 : b.meter_id > a.meter_id ? -1 : 0
			);
		} else if (isSortByMeterIDDesc) {
			lsDeviceDisplay.sort((a, b) =>
				a.meter_id > b.meter_id ? -1 : b.meter_id > a.meter_id ? 1 : 0
			);
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
					device.meter_id.includes(searchText) ||
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
											<td>{device.meter_id}</td>
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
					<Row>
						<Col sm={2}></Col>
					</Row>
				)}
			</div>
		);
	}
}

export default Meter;
