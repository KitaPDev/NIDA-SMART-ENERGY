// import React from "react";

// class TableActivityLog extends React.Component {
// 	handleBtnClick = () => {
// 		if (order === "desc") {
// 			this.refs.table.handleSort("asc", "name");
// 			order = "asc";
// 		} else {
// 			this.refs.table.handleSort("desc", "name");
// 			order = "desc";
// 		}
// 	};

// 	render() {
// 		return (
// 			<div>
// 				<p style={{ color: "red" }}>
// 					You cam click header to sort or click following button to perform a
// 					sorting by expose API
// 				</p>
// 				<button onClick={this.handleBtnClick}>Sort Product Name</button>
// 				<BootstrapTable ref="table" data={products}>
// 					<TableHeaderColumn dataField="id" isKey={true} dataSort={true}>
// 						Product ID
// 					</TableHeaderColumn>
// 					<TableHeaderColumn dataField="name" dataSort={true}>
// 						Product Name
// 					</TableHeaderColumn>
// 					<TableHeaderColumn dataField="price">Product Price</TableHeaderColumn>
// 				</BootstrapTable>
// 			</div>
// 		);
// 	}
// }

// export default TableActivityLog;
