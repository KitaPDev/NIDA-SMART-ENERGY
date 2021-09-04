import React from "react";

import "./DeviceManager.css";
import {
	Col,
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
import { MdModeEdit, MdDelete } from "react-icons/md";
import { GiConfirmed, GiCancel } from "react-icons/gi";

import dateFormatter from "../../../utils/dateFormatter";
import http from "../../../utils/http";
import csv from "../../../utils/csv";

import { withTranslation } from "react-i18next";

class DeviceManager extends React.Component {
	constructor(props) {
		super(props);

		const { t } = this.props;

		this.state = {
			lsDevice: [],
			lsBuilding: [],
			lsSystem: [],
			isSortByDeviceIDAsc: false,
			isSortByDeviceIDDesc: false,
			isSortByStatusActive: false,
			isSortByStatusInactive: false,
			isSortByDateActivatedAsc: false,
			isSortByDateActivatedDesc: false,
			searchText: "",
			isModalAddMeterOpen: false,
			isModalConfirmAddMeterOpen: false,
			isModalConfirmEditMeterOpen: false,
			isModalConfirmDeleteMeterOpen: false,
			deviceID: "",
			deviceIDEdit: "",
			deviceIDDelete: "",
			building: "",
			floor: "",
			location: "",
			site: "",
			brandModel: "",
			system: t("Main"),
			isActive: false,
			activatedDate: "",
			lsPermission: JSON.parse(localStorage.getItem("lsPermission")),
		};

		this.toggleSortByDeviceID = this.toggleSortByDeviceID.bind(this);
		this.toggleSortByStatus = this.toggleSortByStatus.bind(this);
		this.toggleSortByDateActivated = this.toggleSortByDateActivated.bind(this);
		this.toggleModalAddMeter = this.toggleModalAddMeter.bind(this);
		this.toggleModalConfirmAddMeter =
			this.toggleModalConfirmAddMeter.bind(this);
		this.toggleModalConfirmDeleteMeter =
			this.toggleModalConfirmDeleteMeter.bind(this);
		this.toggleModalConfirmEditMeter =
			this.toggleModalConfirmEditMeter.bind(this);
		this.getAllBuilding = this.getAllBuilding.bind(this);
		this.getAllSystem = this.getAllSystem.bind(this);
		this.getAllDevice = this.getAllDevice.bind(this);
		this.addMeter = this.addMeter.bind(this);
		this.editMeter = this.editMeter.bind(this);
		this.deleteMeter = this.deleteMeter.bind(this);
		this.setMeterEditMode = this.setMeterEditMode.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.exportTable = this.exportTable.bind(this);
	}

	componentDidMount() {
		this.getAllBuilding();
		this.getAllSystem();
		this.getAllDevice();
	}

	toggleSortByDeviceID() {
		let { isSortByDeviceIDAsc, isSortByDeviceIDDesc } = this.state;

		if (!(isSortByDeviceIDAsc || isSortByDeviceIDDesc)) {
			this.setState({
				isSortByDeviceIDAsc: true,
				isSortByDeviceIDDesc: false,
				isSortByStatusActive: false,
				isSortByStatusInactive: false,
				isSortByDateActivatedAsc: false,
				isSortByDateActivatedDesc: false,
			});
		} else if (isSortByDeviceIDAsc) {
			this.setState({
				isSortByDeviceIDAsc: false,
				isSortByDeviceIDDesc: true,
				isSortByStatusActive: false,
				isSortByStatusInactive: false,
				isSortByDateActivatedAsc: false,
				isSortByDateActivatedDesc: false,
			});
		} else if (isSortByDeviceIDDesc) {
			this.setState({
				isSortByDeviceIDAsc: true,
				isSortByDeviceIDDesc: false,
				isSortByStatusActive: false,
				isSortByStatusInactive: false,
				isSortByDateActivatedAsc: false,
				isSortByDateActivatedDesc: false,
			});
		}
	}

	toggleSortByStatus() {
		let { isSortByStatusActive, isSortByStatusInactive } = this.state;

		if (!(isSortByStatusActive || isSortByStatusInactive)) {
			this.setState({
				isSortByStatusActive: true,
				isSortByStatusInactive: false,
				isSortByDeviceIDAsc: false,
				isSortByDeviceIDDesc: false,
				isSortByDateActivatedAsc: false,
				isSortByDateActivatedDesc: false,
			});
		} else if (isSortByStatusActive) {
			this.setState({
				isSortByStatusActive: false,
				isSortByStatusInactive: true,
				isSortByDeviceIDAsc: false,
				isSortByDeviceIDDesc: false,
				isSortByDateActivatedAsc: false,
				isSortByDateActivatedDesc: false,
			});
		} else if (isSortByStatusInactive) {
			this.setState({
				isSortByStatusActive: true,
				isSortByStatusInactive: false,
				isSortByDeviceIDAsc: false,
				isSortByDeviceIDDesc: false,
				isSortByDateActivatedAsc: false,
				isSortByDateActivatedDesc: false,
			});
		}
	}

	toggleSortByDateActivated() {
		let { isSortByDateActivatedAsc, isSortByDateActivatedDesc } = this.state;

		if (!(isSortByDateActivatedAsc || isSortByDateActivatedDesc)) {
			this.setState({
				isSortByDateActivatedAsc: true,
				isSortByDateActivatedDesc: false,
				isSortByStatusActive: false,
				isSortByStatusInactive: false,
				isSortByDeviceIDAsc: false,
				isSortByDeviceIDDesc: false,
			});
		} else if (isSortByDateActivatedAsc) {
			this.setState({
				isSortByDateActivatedDesc: true,
				isSortByDateActivatedAsc: false,
				isSortByStatusActive: false,
				isSortByStatusInactive: false,
				isSortByDeviceIDAsc: false,
				isSortByDeviceIDDesc: false,
			});
		} else if (isSortByDateActivatedDesc) {
			this.setState({
				isSortByDateActivatedAsc: true,
				isSortByDateActivatedDesc: false,
				isSortByStatusActive: false,
				isSortByStatusInactive: false,
				isSortByDeviceIDAsc: false,
				isSortByDeviceIDDesc: false,
			});
		}
	}

	toggleModalAddMeter() {
		this.setState((prevState) => ({
			isModalAddMeterOpen: !prevState.isModalAddMeterOpen,
			deviceIDEdit: "",
			deviceID: "",
			building: "",
			floor: "",
			location: "",
			site: "",
			brandModel: "",
			system: "Main",
			isActive: false,
			activatedDate: "",
		}));
	}

	toggleModalConfirmAddMeter() {
		this.setState((prevState) => ({
			isModalConfirmAddMeterOpen: !prevState.isModalConfirmAddMeterOpen,
		}));
	}

	toggleModalConfirmEditMeter() {
		this.setState((prevState) => ({
			isModalConfirmEditMeterOpen: !prevState.isModalConfirmEditMeterOpen,
		}));
	}

	toggleModalConfirmDeleteMeter(deviceID) {
		this.setState((prevState) => ({
			isModalConfirmDeleteMeterOpen: !prevState.isModalConfirmDeleteMeterOpen,
			deviceIDDelete: deviceID,
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

	async getAllSystem() {
		try {
			let resp = await http.get("/system/all");

			this.setState({ lsSystem: resp.data });
		} catch (err) {
			console.log(err);
			return err.response;
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

	async addMeter() {
		let {
			lsBuilding,
			lsSystem,
			deviceID,
			building,
			floor,
			location,
			site,
			brandModel,
			system,
			activatedDate,
			lsDevice,
		} = this.state;

		try {
			if (deviceID.length === 0) {
				alert("Meter ID is required.");
				return;
			}

			if (lsDevice.find((d) => d.id === deviceID)) {
				alert("Meter already exists");
				return;
			}

			if (system.length === 0) {
				alert("System is required.");
				return;
			}

			if (activatedDate === "" || activatedDate === undefined) {
				activatedDate = new Date();
			}

			const { t } = this.props;

			building = lsBuilding.find((b) => t(b.label) === t(building)).label;
			system = lsSystem.find((s) => t(s.label) === t(system)).label;

			let payload = {
				id: deviceID,
				building: building,
				floor: floor,
				location: location,
				site: site,
				brand_model: brandModel,
				system: system,
				activated_datetime: activatedDate,
			};

			await http.post("/device", payload);

			this.toggleModalConfirmAddMeter();
			this.toggleModalAddMeter();
			this.getAllDevice();
		} catch (err) {
			console.log(err);
			alert("Failed to add Meter. Please try again.");

			this.toggleModalConfirmAddMeter();
			this.toggleModalAddMeter();

			return err.response;
		}
	}

	setMeterEditMode(deviceID) {
		if (deviceID !== "") {
			let { lsDevice } = this.state;
			let device = lsDevice.find((device) => {
				return device.id === deviceID;
			});

			this.setState({
				building: device.building,
				floor: device.floor,
				location: device.location,
				site: device.site,
				brandModel: device.brand_model,
				system: device.system,
				activatedDate: new Date(device.activated_datetime),
			});
		}

		this.setState({ deviceIDEdit: deviceID });
	}

	async editMeter() {
		let {
			lsBuilding,
			lsSystem,
			deviceIDEdit,
			deviceID,
			building,
			floor,
			location,
			site,
			brandModel,
			system,
			activatedDate,
		} = this.state;

		try {
			if (deviceID.length === 0) {
				deviceID = deviceIDEdit;
			}

			if (system.length === 0) {
				alert("System is required.");
				return;
			}

			if (activatedDate === undefined) activatedDate = new Date();

			const { t } = this.props;

			building = lsBuilding.find((b) => t(b.label) === building).label;
			system = lsSystem.find((s) => t(s.label) === system).label;

			let payload = {
				id: deviceID,
				building: building,
				floor: floor,
				location: location,
				site: site,
				brand_model: brandModel,
				system: system,
				activated_datetime: activatedDate,
			};

			await http.post("/device/edit", payload);

			this.setState({
				deviceID: "",
				isModalConfirmEditMeterOpen: false,
				deviceIDEdit: "",
			});

			this.getAllDevice();
		} catch (err) {
			console.log(err);
			alert("Failed to edit Meter. Please try again.");
			this.toggleModalConfirmEditMeter();
			return err.response;
		}
	}

	async deleteMeter() {
		try {
			let { deviceIDDelete } = this.state;

			let payload = { id: deviceIDDelete };

			await http.post("/device/delete", payload);

			this.setState({
				deviceIDDelete: "",
				isModalConfirmDeleteMeterOpen: false,
			});

			this.getAllDevice();
		} catch (err) {
			console.log(err);
			alert("Failed to delete Meter. Please try again.");
			this.toggleModalConfirmDeleteMeter();
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
			lsDevice,
			isSortByDeviceIDAsc,
			isSortByDeviceIDDesc,
			isSortByStatusActive,
			isSortByStatusInactive,
			isSortByDateActivatedAsc,
			isSortByDateActivatedDesc,
			searchText,
			isModalAddMeterOpen,
			isModalConfirmAddMeterOpen,
			isModalConfirmEditMeterOpen,
			isModalConfirmDeleteMeterOpen,
			building,
			floor,
			location,
			site,
			brandModel,
			system,
			activatedDate,
			lsBuilding,
			lsSystem,
			deviceIDEdit,
			deviceID,
			lsPermission,
		} = this.state;

		const { t } = this.props;

		let lsDeviceDisplay = lsDevice.slice();

		if (isSortByDeviceIDAsc) {
			lsDeviceDisplay.sort((a, b) => (a.id > b.id ? 1 : b.id > a.id ? -1 : 0));
		} else if (isSortByDeviceIDDesc) {
			lsDeviceDisplay.sort((a, b) => (a.id > b.id ? -1 : b.id > a.id ? 1 : 0));
		} else if (isSortByStatusActive) {
			lsDeviceDisplay.sort((a, b) =>
				a.is_active === 1 ? -1 : a.is_active === 0 ? 1 : 0
			);
		} else if (isSortByStatusInactive) {
			lsDeviceDisplay.sort((a, b) =>
				a.is_active === 0 ? -1 : a.is_active === 1 ? 1 : 0
			);
		} else if (isSortByDateActivatedAsc) {
			lsDeviceDisplay.sort(
				(a, b) =>
					new Date(a.activated_datetime).getTime() -
					new Date(b.activated_datetime).getTime()
			);
		} else if (isSortByDateActivatedDesc) {
			lsDeviceDisplay.sort(
				(a, b) =>
					new Date(b.activated_datetime).getTime() -
					new Date(a.activated_datetime).getTime()
			);
		}

		if (searchText.length > 0) {
			lsDeviceDisplay = lsDeviceDisplay.filter((device) => {
				for (let [, value] of Object.entries(device)) {
					if (value !== null) {
						if (t(value).toString().includes(searchText)) {
							return true;
						}
					}
				}

				return false;
			});
		}

		if (deviceIDEdit.length > 0 && deviceID.length === 0) {
			deviceID = deviceIDEdit;
		}

		return (
			<div className="container-device-manager">
				<div className="row-heading" style={{ maxHeight: "6%" }}>
					<div className="col-heading">{t("Device Manager")}</div>
					<div className="col-excel-icon">
						{lsPermission.find((p) => p.label === "Export Information") ? (
							<RiFileExcel2Fill
								className="icon-excel"
								size={25}
								onClick={() => this.exportTable()}
							/>
						) : (
							<></>
						)}
					</div>
					<div className="col-right">
						<div className="div-add-meter" onClick={this.toggleModalAddMeter}>
							<IoMdAddCircle className="btn-add-meter" size={30} />{" "}
							{t("Add Meter")}
						</div>

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
					</div>
				</div>
				<Container className="container-table-device-manager" fluid>
					<Table className="table-device-manager">
						<thead className="device-table-head">
							<tr>
								<th
									className={
										isSortByDeviceIDAsc
											? "sort_asc"
											: isSortByDeviceIDDesc
											? "sort_desc"
											: "sort"
									}
									onClick={this.toggleSortByDeviceID}
								>
									{t("device.Meter")} ID
								</th>
								<th>{t("Building")}</th>
								<th>{t("Floor")}</th>
								<th>{t("Location")}</th>
								<th>{t("Site")}</th>
								<th>{t("Brand / Model")}</th>
								<th>{t("System")}</th>
								{deviceIDEdit !== "" ? (
									""
								) : (
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
								)}

								<th
									className={
										isSortByDateActivatedAsc
											? "sort_asc"
											: isSortByDateActivatedDesc
											? "sort_desc"
											: "sort"
									}
									onClick={this.toggleSortByDateActivated}
								>
									{t("Activated Date")}
								</th>
								<th></th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{lsDeviceDisplay.map((device) => (
								<tr>
									<td>{device.id}</td>
									<td>
										{deviceIDEdit === device.id ? (
											<Input
												type="select"
												name="building"
												id="building"
												value={t(building)}
												onChange={this.handleInputChange}
											>
												<option></option>
												{lsBuilding.map((building) => (
													<option>{t(building.label)}</option>
												))}
											</Input>
										) : (
											t(device.building)
										)}
									</td>
									<td>
										{deviceIDEdit === device.id ? (
											<Input
												type="number"
												name="floor"
												id="floor"
												min="0"
												value={floor}
												onChange={this.handleInputChange}
											/>
										) : (
											device.floor
										)}
									</td>
									<td>
										{deviceIDEdit === device.id ? (
											<Input
												type="text"
												name="location"
												id="location"
												value={location}
												onChange={this.handleInputChange}
											/>
										) : (
											device.location
										)}
									</td>
									<td>
										{deviceIDEdit === device.id ? (
											<Input
												type="text"
												name="site"
												id="site"
												value={site}
												onChange={this.handleInputChange}
											/>
										) : (
											device.site
										)}
									</td>
									<td>
										{deviceIDEdit === device.id ? (
											<Input
												type="text"
												name="brandModel"
												id="brandModel"
												value={brandModel}
												onChange={this.handleInputChange}
											/>
										) : (
											device.brand_model
										)}
									</td>
									<td>
										{deviceIDEdit === device.id ? (
											<Input
												type="select"
												name="system"
												id="system"
												value={t(system)}
												onChange={this.handleInputChange}
											>
												{lsSystem.map((system) => (
													<option>{t(system.label)}</option>
												))}
											</Input>
										) : (
											t(device.system)
										)}
									</td>
									{deviceIDEdit === device.id ? (
										""
									) : (
										<td>
											<span
												className={
													device.is_active === true ? "green-dot" : "red-dot"
												}
											></span>
										</td>
									)}
									<td>
										{deviceIDEdit === device.id ? (
											<Input
												type="date"
												name="activatedDate"
												id="activatedDate"
												placeholder="datetime placeholder"
												value={
													activatedDate
														? dateFormatter.yyyymmdd_input(activatedDate)
														: dateFormatter.yyyymmdd_input(
																new Date(device.activated_datetime)
														  )
												}
												onChange={this.handleInputChange}
											/>
										) : (
											dateFormatter.ddmmyyyy(
												new Date(device.activated_datetime)
											)
										)}
									</td>
									<td className="icon">
										{deviceIDEdit === device.id ? (
											<GiConfirmed
												size={20}
												onClick={() => this.toggleModalConfirmEditMeter()}
											/>
										) : (
											<MdModeEdit
												size={20}
												onClick={() => this.setMeterEditMode(device.id)}
											/>
										)}
									</td>
									<td className="icon">
										{deviceIDEdit === device.id ? (
											<GiCancel
												size={20}
												onClick={() => this.setMeterEditMode("")}
											/>
										) : (
											<MdDelete
												size={20}
												onClick={() =>
													this.toggleModalConfirmDeleteMeter(device.id)
												}
											/>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</Table>
				</Container>
				<Modal
					isOpen={isModalAddMeterOpen}
					toggle={this.toggleModalAddMeter}
					size="lg"
				>
					<ModalHeader toggle={this.toggleModalAddMeter}>
						{t("Add Meter")}
					</ModalHeader>
					<ModalBody>
						<Form className="form-add-meter">
							<FormGroup row>
								<Label for="deviceID" sm={2} className="label-deviceID">
									{t("Meter")} ID
								</Label>
								<Col sm={4}>
									<Input
										type="text"
										name="deviceID"
										id="deviceID"
										value={deviceID}
										onChange={this.handleInputChange}
									/>
								</Col>
								<Label for="site" sm={2} className="label-site">
									{t("Site")}
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
								<Label for="building" sm={1} className="label-building">
									{t("Building")}
								</Label>
								<Col sm={4}>
									<Input
										type="select"
										name="building"
										id="building"
										value={building}
										onChange={this.handleInputChange}
									>
										<option></option>
										{lsBuilding.map((building) => (
											<option>{t(building.label)}</option>
										))}
									</Input>
								</Col>

								<Label for="brandModel" sm={2} className="label-brand-model">
									{t("Brand / Model")}
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
									{t("Floor")}
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
									{t("Activated Date")}
								</Label>
								<Col sm={4}>
									<Input
										type="date"
										name="activatedDate"
										id="activatedDate"
										value={
											activatedDate
												? dateFormatter.yyyymmdd_input(activatedDate)
												: dateFormatter.yyyymmdd_input(new Date())
										}
										onChange={this.handleInputChange}
									/>
								</Col>
							</FormGroup>
							<FormGroup row>
								<Label for="location" sm={2} className="label-location">
									{t("Location")}
								</Label>
								<Col sm={6}>
									<Input
										type="text"
										name="location"
										id="location"
										value={location}
										onChange={this.handleInputChange}
									/>
								</Col>
								<Label for="systsem" sm={1} className="label-system">
									{t("System")}
								</Label>
								<Col sm={3}>
									<Input
										type="select"
										name="system"
										id="system"
										value={t(`${system}`)}
										onChange={this.handleInputChange}
									>
										{lsSystem.map((system) => (
											<option>{t(`${system.label}`)}</option>
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
							{t("Add")}
						</Button>{" "}
						<Button className="btn-discard" onClick={this.toggleModalAddMeter}>
							{t("Discard")}
						</Button>
					</ModalFooter>
				</Modal>
				<Modal
					isOpen={isModalConfirmAddMeterOpen}
					toggle={this.toggleModalConfirmAddMeter}
				>
					<ModalHeader toggle={this.toggleModalConfirmAddMeter}>
						{t("Confirm Add Meter")}
					</ModalHeader>
					<ModalFooter>
						<Button color="primary" onClick={this.addMeter}>
							{t("Confirm")}
						</Button>{" "}
						<Button color="danger" onClick={this.toggleModalConfirmAddMeter}>
							{t("Cancel")}
						</Button>
					</ModalFooter>
				</Modal>
				<Modal
					isOpen={isModalConfirmEditMeterOpen}
					toggle={this.toggleModalConfirmEditMeter}
				>
					<ModalHeader toggle={this.toggleModalConfirmEditMeter}>
						{t("Confirm Edit Meter")}
					</ModalHeader>
					<ModalFooter>
						<Button color="primary" onClick={this.editMeter}>
							{t("Confirm")}
						</Button>{" "}
						<Button color="danger" onClick={this.toggleModalConfirmEditMeter}>
							{t("Cancel")}
						</Button>
					</ModalFooter>
				</Modal>
				<Modal
					isOpen={isModalConfirmDeleteMeterOpen}
					toggle={this.toggleModalConfirmDeleteMeter}
				>
					<ModalHeader toggle={this.toggleModalConfirmDeleteMeter}>
						{t("Confirm Delete Meter")}
					</ModalHeader>
					<ModalFooter>
						<Button color="primary" onClick={this.deleteMeter}>
							{t("Confirm")}
						</Button>{" "}
						<Button color="danger" onClick={this.toggleModalConfirmDeleteMeter}>
							{t("Cancel")}
						</Button>
					</ModalFooter>
				</Modal>
			</div>
		);
	}
}

export default withTranslation()(DeviceManager);
