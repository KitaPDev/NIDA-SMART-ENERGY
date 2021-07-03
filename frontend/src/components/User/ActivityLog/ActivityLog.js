import React from "react";
import "./ActivityLog.css";
import { Container, Row, Col, Form, FormGroup, Input, Label } from "reactstrap";
import { IoMdSearch } from "react-icons/io";
// import TableActivityLog from "./TableActivityLog/TableActivityLog";

class ActivityLog extends React.Component {
	constructor(props) {
		super(props);
		let tzOffset = new Date().getTimezoneOffset() * 60000;

		let dateFrom = new Date(
			new Date(new Date(Date.now() - tzOffset).setHours(0, 0, 0, 0)) - tzOffset
		);

		this.state = {
			dateFrom: dateFrom.toISOString().substring(0, 16),
			dateTo: new Date(Date.now() - tzOffset).toISOString().substring(0, 16),
			searchText: "",
		};

		this.handleChangeDateTo = this.handleChangeDateTo.bind(this);
		this.handleChangeDateFrom = this.handleChangeDateFrom.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
	}

	handleChangeDateFrom(e) {
		let { dateTo } = this.state;
		let dateFrom = e.target.value;

		if (new Date(dateFrom).getTime() > new Date(dateTo).getTime()) {
			alert("Date From must be before date To.");
			return;
		}

		this.setState({
			dateFrom: dateFrom,
		});
	}

	handleChangeDateTo(e) {
		let { dateFrom } = this.state;
		let dateTo = e.target.value;

		if (new Date(dateFrom).getTime() > new Date(dateTo).getTime()) {
			alert("Date To must be after date From.");
			return;
		}

		this.setState({
			dateTo: dateTo,
		});
	}

	handleInputChange(e) {
		this.setState({ [e.target.name]: e.target.value });
	}

	render() {
		let { dateFrom, dateTo, searchText } = this.state;

		return (
			<div class="activity-log">
				<Container fluid className="container-activity-log">
					<Row className="heading">Activity Log</Row>
					<Row className="row-input">
						<Form>
							<FormGroup row className="fg-period">
								<Label for="dateFrom" sm={1}>
									From
								</Label>
								<Col sm={2}>
									<Input
										className="datepicker"
										type="datetime-local"
										name="dateFrom"
										id="dateFrom"
										placeholder="datetime placeholder"
										value={dateFrom}
										onChange={this.handleChangeDateFrom}
									/>
								</Col>
								<Label for="dateTo" sm={1}>
									To
								</Label>
								<Col sm={2}>
									<Input
										className="datepicker"
										type="datetime-local"
										name="dateTo"
										id="dateTo"
										placeholder="datetime placeholder"
										value={dateTo}
										onChange={this.handleChangeDateTo}
									/>
								</Col>
							</FormGroup>
							<FormGroup row className="fg-search">
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
					<Container></Container>
				</Container>
			</div>
		);
	}
}

export default ActivityLog;
