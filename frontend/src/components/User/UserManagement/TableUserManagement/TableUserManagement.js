import React from "react";
import BootstrapTable from "react-bootstrap-table-next";
import filterFactory, { textFilter } from "react-bootstrap-table2-filter";

class TableUserManagement extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			data: this.props.data,
			columns: [
				{
					dataField: "username",
					text: "Username",
					sort: true,
				},
				{
					dataField: "email",
					text: "Email",
				},
				{
					dataField: "user_type",
					text: "User Type",
				},
				{
					dataField: "activated_timestamp",
					text: "Activated Date",
					sort: true,
				},
				{
					dataField: "last_login_timestamp",
					text: "Last Login",
					sort: true,
				},
			],
		};
	}

	render() {
		let { data, columns } = this.state;

		return (
			<div>
				<BootstrapTable keyField="username" data={data} columns={columns} />
			</div>
		);
	}
}

export default TableUserManagement;
