import React from "react";
import "./DeviceManager.css";
import { Col, Row, Table } from "reactstrap";
import { RiFileExcel2Fill } from "react-icons/ri";

class DeviceManager extends React.Component {
	render() {
		return (
			<div className="div-device-manager">
				<Row className="row-heading">
					<Col sm={3} className="col-heading">
						Device Manager
					</Col>
					<Col sm={1} className="col-excel-icon">
						<RiFileExcel2Fill className="excel-icon" size={30} />
					</Col>
					<Col sm={8}></Col>
				</Row>
				<Row>
					<Table>
						<thead>
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
