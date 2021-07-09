import React from "react";
import "./SetPermission.css";
import { Row, Col, Container, Table } from "reactstrap";
import http from "../../../util/httpService";

class SetPermission extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			lsUserTypePermission: [],
			lsPermission: [],
			lsUserType: [],
		};

		this.getAllUserType = this.getAllUserType.bind(this);
		this.getAllPermission = this.getAllPermission.bind(this);
		this.getAllUserTypePermission = this.getAllUserTypePermission.bind(this);
	}

	async getAllUserType() {
		try {
			let resp = await http.get("/user/user-type/all");

			let lsUserType = resp.data;
			lsUserType.splice(0, 1);

			this.setState({ lsUserType: lsUserType });
		} catch (err) {
			console.log(err);
		}
	}

	async getAllPermission() {
		try {
			let resp = await http.get("/permission/all");

			let lsPermission = resp.data;

			this.setState({ lsPermission: lsPermission });
		} catch (err) {
			console.log(err);
		}
	}

	async getAllUserTypePermission() {
		try {
			let resp = await http.get("/permission/user-type");

			let lsUserTypePermission = resp.data;

			this.setState({ lsUserTypePermission: lsUserTypePermission });
		} catch (err) {
			console.log(err);
		}
	}

	render() {
		let { lsUserTypePermission, lsPermission, lsUserType } = this.state;

		return (
			<div className="set-permission">
				<Row className="row-heading">
					<Col sm={3} className="col-heading">
						Set Permission
					</Col>
				</Row>
				<Container className="container-set-permission">
					<Table className="table-set-permission">
						<thead>
							<tr>
								<th></th>
								{lsUserType.map((userType) => (
									<th>{userType.label}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{lsPermission.map((permission) => (
								<tr>
									<td>{permission.label}</td>
									{lsUserTypePermission.map((userTypePermission) => (
										<td></td>
									))}
								</tr>
							))}
						</tbody>
					</Table>
				</Container>
			</div>
		);
	}
}

export default SetPermission;
