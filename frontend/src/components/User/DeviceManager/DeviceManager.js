import React from "react";
import "./DeviceManager.css";
import {
	Col,
	Row,
	Table,
	Container,
	Form,
	FormGroup,
	Label,
	Input,
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
} from "reactstrap";
import { RiFileExcel2Fill } from "react-icons/ri";
import { IoMdSearch, IoMdAddCircle } from "react-icons/io";
import dateFormatter from "../../../util/dateFormatter";
import http from "../../../util/httpService";

class DeviceManager extends React.Component {
	constructor(props) {
		super(props);

		let tzOffset = new Date().getTimezoneOffset() * 60000;

		this.state = {
			lsDevice: [],
			lsBuilding: [],
			lsElectricalSystem: [],
			isSortByMeterIDAsc: false,
			isSortByMeterIDDesc: false,
			isSortByStatusActive: false,
			isSortByStatusInactive: false,
			searchText: "",
			isModalAddMeterOpen: false,
			isModalConfirmAddMeterOpen: false,
			meterID: "",
			building: "",
			floor: 0,
			location: "",
			site: "",
			brandModel: "",
			system: "Main",
			isActive: false,
			activatedDate: new Date(Date.now() - tzOffset)
				.toISOString()
				.substring(0, 16),
		};

		this.toggleSortByMeterID = this.toggleSortByMeterID.bind(this);
		this.toggleSortByStatus = this.toggleSortByStatus.bind(this);
		this.toggleModalAddMeter = this.toggleModalAddMeter.bind(this);
		this.toggleModalConfirmAddMeter =
			this.toggleModalConfirmAddMeter.bind(this);
		this.getAllBuilding = this.getAllBuilding.bind(this);
		this.getAllElectricalSystem = this.getAllElectricalSystem.bind(this);
		this.addMeter = this.addMeter.bind(this);
	}

	componentDidMount() {
		this.getAllBuilding();
		this.getAllElectricalSystem();
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

	toggleModalAddMeter() {
		this.setState((prevState) => ({
			isModalAddMeterOpen: !prevState.isModalAddMeterOpen,
		}));
	}

	toggleModalConfirmAddMeter() {
		this.setState((prevState) => ({
			isModalConfirmAddMeterOpen: !prevState.isModalConfirmAddMeterOpen,
		}));
	}

	handleInputChange(e) {
		this.setState({ [e.target.name]: e.target.value });
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

	async getAllElectricalSystem() {
		try {
			let resp = await http.get("/electricalSystem/all");

			this.setState({ lsElectricalSystem: resp.data });
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async addMeter() {
		let {
			meterID,
			building,
			floor,
			location,
			site,
			brandModel,
			system,
			activatedDate,
		} = this.state;

		try {
			if (meterID.length === 0) {
				alert("Meter ID is requireds.");
			}

			if (building.length === 0) {
				alert("Building is required.");
			}

			if (location.length === 0) {
				alert("Location is required.");
			}

			if (site.length === 0) {
				alert("Site is required.");
			}

			if (brandModel.length === 0) {
				alert("Brand / Model is required.");
			}

			if (system.length === 0) {
				alert("System is required.");
			}

			let payload = {
				meter_id: meterID,
				building: building,
				floor: floor,
				location: location,
				site: site,
				brand_model: brandModel,
				system: system,
				activated_date: activatedDate,
			};

			let resp = await http.post("/device", payload);

			if (resp.status === 200) {
				alert("Meter has been created.");
			}
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	render() {
		let {
			lsDevice,
			isSortByMeterIDAsc,
			isSortByMeterIDDesc,
			isSortByStatusActive,
			isSortByStatusInactive,
			searchText,
			isModalAddMeterOpen,
			isModalConfirmAddMeterOpen,
			meterID,
			building,
			floor,
			location,
			site,
			brandModel,
			system,
			isActive,
			activatedDate,
			lsBuilding,
			lsElectricalSystem,
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
						.ddmmyyyy(new Date(device.logged_timestamp))
						.includes(searchText)
				);
			});
		}

		return (
			<div className="div-device-manager">
				<Row className="row-heading">
					<Col sm={3} className="col-heading">
						Device Manager
					</Col>
					<Col sm={1} className="col-excel-icon">
						<RiFileExcel2Fill className="excel-icon" size={25} />
					</Col>
					<Col sm={8}></Col>
				</Row>
				<Container className="container-table-device-manager">
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
									<td>{device.status}</td>
									<td>{dateFormatter.ddmmyyyy(device.activated_timestamp)}</td>
									<td></td>
									<td></td>
								</tr>
							))}
						</tbody>
					</Table>
				</Container>
				<div className="div-add-meter" onClick={this.toggleModalAddMeter}>
					<IoMdAddCircle className="btn-add-meter" size={50} />
				</div>
				<Modal
					isOpen={isModalAddMeterOpen}
					toggle={this.toggleModalAddMeter}
					size="lg"
				>
					<ModalHeader toggle={this.toggleModalAddMeter}>Add Meter</ModalHeader>
					<ModalBody>
						<Form className="form-add-meter">
							<FormGroup row>
								<Label for="meterID" sm={2} className="label-meterID">
									Meter ID
								</Label>
								<Col sm={4}>
									<Input
										type="text"
										name="meterID"
										id="meterID"
										value={meterID}
										onChange={this.handleInputChange}
									/>
								</Col>
								<Label for="site" sm={2} className="label-site">
									Site
								</Label>
								<Col sm={4}>
									<Input
										type="text"
										name="site"
										id="site"
										value={site}
										onChange={this.handleInputChange}
									/>
								</Col>
							</FormGroup>
							<FormGroup row>
								<Label for="building" sm={2} className="label-building">
									Building
								</Label>
								<Col sm={4}>
									<Input
										type="select"
										name="building"
										id="building"
										value={building}
										onChange={this.handleInputChange}
									>
										{lsBuilding.map((building) => (
											<option>{building.label}</option>
										))}
									</Input>
								</Col>

								<Label for="brandModel" sm={2} className="label-brand-model">
									Brand / Model
								</Label>
								<Col sm={4}>
									<Input
										type="text"
										name="brandModel"
										id="brandModel"
										value={brandModel}
										onChange={this.handleInputChange}
									/>
								</Col>
							</FormGroup>
							<FormGroup row>
								<Label for="floor" sm={2} className="label-floor">
									Floor
								</Label>
								<Col sm={4}>
									<Input
										type="number"
										name="floor"
										id="floor"
										min="0"
										value={floor}
										onChange={this.handleInputChange}
									/>
								</Col>
								<Label
									for="activatedDate"
									sm={2}
									className="label-activated-date"
								>
									Activated Date
								</Label>
								<Col sm={4}>
									<Input
										type="datetime-local"
										name="activatedDate"
										id="activatedDate"
										value={activatedDate}
										onChange={this.handleInputChange}
									/>
								</Col>
							</FormGroup>
							<FormGroup row>
								<Label for="location" sm={2} className="label-location">
									Location
								</Label>
								<Col sm={4}>
									<Input
										type="text"
										name="location"
										id="location"
										value={location}
										onChange={this.handleInputChange}
									/>
								</Col>
								<Label for="systsem" sm={2} className="label-system">
									System
								</Label>
								<Col sm={4}>
									<Input
										type="select"
										name="system"
										id="system"
										value={system}
										onChange={this.handleInputChange}
									>
										{lsElectricalSystem.map((system) => (
											<option>{system.label}</option>
										))}
									</Input>
								</Col>
							</FormGroup>
						</Form>
					</ModalBody>
					<ModalFooter>
						<Button
							className="btn-add"
							onClick={this.toggleModalConfirmAddMeter}
						>
							Add
						</Button>{" "}
						<Button className="btn-discard" onClick={this.toggleModalAddMeter}>
							Discard
						</Button>
					</ModalFooter>
				</Modal>
				<Modal
					isOpen={isModalConfirmAddMeterOpen}
					toggle={this.toggleModalConfirmAddMeter}
				>
					<ModalHeader toggle={this.toggleModalConfirmAddMeter}>
						Confirm Add Meter
					</ModalHeader>
					<ModalFooter>
						<Button color="primary" onClick={this.approve}>
							Confirm
						</Button>{" "}
						<Button color="danger" onClick={this.toggleModalConfirmAddMeter}>
							Cancel
						</Button>
					</ModalFooter>
				</Modal>
			</div>
		);
	}
}

export default DeviceManager;
