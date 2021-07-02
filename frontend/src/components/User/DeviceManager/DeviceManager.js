import React from "react";
import "./DeviceManager.css";
import { Col, Row, Table } from "reactstrap";
import { RiFileExcel2Fill } from "react-icons/ri";
import BootstrapTable from "react-bootstrap-table-next";

class DeviceManager extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
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
				<Row className="row-table">
					<Table responsive>
						<thead className="device-table-head">
							<th>Meter ID</th>
							<th>Building</th>
							<th>Location</th>
							<th>Site</th>
							<th>Brand / Model</th>
							<th>System</th>
							<th>Status</th>
							<th>Activated Date</th>
						</thead>
						<tbody></tbody>
					</Table>
				</Row>
			</div>
		);
	}
}

export default DeviceManager;
