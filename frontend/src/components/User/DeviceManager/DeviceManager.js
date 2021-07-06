import React from "react";
import "./DeviceManager.css";
import { Col, Row, Table, Container } from "reactstrap";
import { RiFileExcel2Fill } from "react-icons/ri";

class DeviceManager extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			lsDevice: [],
			isSortByMeterIDAsc: false,
			isSortByMeterIDDesc: false,
			isSortByStatusActive: false,
			isSortByStatusInactive: false,
		};

		this.toggleSortByMeterID = this.toggleSortByMeterID.bind(this);
		this.toggleSortByStatus = this.toggleSortByStatus.bind(this);
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
			lsDevice,
			isSortByMeterIDAsc,
			isSortByMeterIDDesc,
			isSortByStatusActive,
			isSortByStatusInactive,
		} = this.state;

		if (isSortByMeterIDAsc) {
			lsDevice.sort((a, b) =>
				a.meter_id > b.meter_id ? 1 : b.meter_id > a.meter_id ? -1 : 0
			);
		} else if (isSortByMeterIDDesc) {
			lsDevice.sort((a, b) =>
				a.meter_id > b.meter_id ? -1 : b.meter_id > a.meter_id ? 1 : 0
			);
		} else if (isSortByStatusActive) {
			lsDevice.sort((a, b) =>
				a.is_active === 1 ? -1 : a.is_active === 0 ? 1 : 0
			);
		} else if (isSortByStatusInactive) {
			lsDevice.sort((a, b) =>
				a.is_active === 0 ? -1 : a.is_active === 1 ? 1 : 0
			);
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
					<Table className="table-device-manager">
						<thead className="device-table-head">
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
						</thead>
						<tbody>
							{lsDevice.map((device, index) => (
								<td></td>
							))}
						</tbody>
					</Table>
				</Container>
			</div>
		);
	}
}

export default DeviceManager;
