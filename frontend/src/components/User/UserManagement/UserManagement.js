import React from "react";
import { Container, Row, Col } from "reactstrap";
import "./UserManagement.css";
import { RiFileExcel2Fill } from "react-icons/ri";
import http from "../../../httpService";
import TableUserManagement from "./TableUserManagement/TableUserManagement";

class UserManagement extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			lsUser: [],
		};

		this.getAllUser = this.getAllUser.bind(this);
	}

	componentDidMount() {
		this.getAllUser();
	}

	async getAllUser() {
		try {
			let resp = await http.get("/user/all");

			this.setState({ lsUser: resp.data });
		} catch (err) {
			console.log(err);
			alert("Unable to activate. Please try again.");
			return err.response;
		}
	}

	render() {
		let { lsUser } = this.state;

		return (
			<div className="user-management">
				<Container className="container-user-management" fluid>
					<Row className="heading">
						User Management{" "}
						<RiFileExcel2Fill className="excel-icon" size={25} />
					</Row>
					<Row className="table-user-management">
						<TableUserManagement data={lsUser} />
					</Row>
				</Container>
			</div>
		);
	}
}

export default UserManagement;
