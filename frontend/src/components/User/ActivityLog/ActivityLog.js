import React from "react";
import "./ActivityLog.css";
import {
	Container,
	Row,
	Col,
	Form,
	FormGroup,
	Input,
	Label,
	Table,
} from "reactstrap";
import { IoMdSearch } from "react-icons/io";
import http from "../../../utils/http";
import dateFormatter from "../../../utils/dateFormatter";
import { RiFileExcel2Fill } from "react-icons/ri";

class ActivityLog extends React.Component {
	constructor(props) {
		super(props);
		let tzOffset = new Date().getTimezoneOffset() * 60000;

		let dateFrom = new Date(
			new Date(new Date(Date.now() - tzOffset).setHours(0, 0, 0, 0)) - tzOffset
		);

		this.state = {
			lsActivity: [],
			dateFrom: dateFrom.toISOString().substring(0, 16),
			dateTo: new Date(Date.now() - tzOffset).toISOString().substring(0, 16),
			isSortByTimestampAsc: false,
			searchText: this.props.location.username
				? this.props.location.username
				: "",
		};

		this.handleChangeDateTo = this.handleChangeDateTo.bind(this);
		this.handleChangeDateFrom = this.handleChangeDateFrom.bind(this);
		this.handleInputChange = this.handleInputChange.bind(this);
		this.toggleSortByTimestamp = this.toggleSortByTimestamp.bind(this);
		this.getActivity = this.getActivity.bind(this);
	}

	componentDidMount() {
		this.getActivity();
	}

	async getActivity() {
		try {
			let { dateFrom, dateTo } = this.state;
			let payload = {
				from: new Date(dateFrom).toISOString().slice(0, 19).replace("T", " "),
				to: new Date(dateTo).toISOString().slice(0, 19).replace("T", " "),
			};

			let resp = await http.post("/activity/", payload);
			if (resp.status === 200) {
				if (resp.data instanceof Array && resp.data.length > 0) {
					this.setState({ lsActivity: resp.data });
				}
			}
		} catch (err) {
			console.log(err);
			return err.response;
		}
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

	toggleSortByTimestamp() {
		this.setState((prevState) => ({
			isSortByTimestampAsc: !prevState.isSortByTimestampAsc,
		}));
	}

	render() {
		let { lsActivity, dateFrom, dateTo, searchText, isSortByTimestampAsc } =
			this.state;

		let lsActivityDisplay = lsActivity.slice();

		if (isSortByTimestampAsc) {
			lsActivityDisplay.sort(
				(a, b) =>
					new Date(a.logged_timestamp).getTime() -
					new Date(b.logged_timestamp).getTime()
			);
		} else {
			lsActivityDisplay.sort(
				(a, b) =>
					new Date(b.logged_timestamp).getTime() -
					new Date(a.logged_timestamp).getTime()
			);
		}

		if (searchText.length > 0) {
			lsActivity = lsActivityDisplay.filter((activity, index) => {
				return (
					activity.username.includes(searchText) ||
					activity.user_type.includes(searchText) ||
					activity.action.includes(searchText) ||
					dateFormatter
						.ddmmyyyy(new Date(activity.logged_timestamp))
						.includes(searchText)
				);
			});
		}

		return (
			<div className="activity-log">
				<Container fluid className="container-activity-log">
					<Row className="row-heading">
						<Col sm={3} className="col-heading">
							Activity Log
						</Col>
						<Col sm={1} className="col-excel-icon">
							<RiFileExcel2Fill className="excel-icon" size={25} />
						</Col>
						<Col sm={8}></Col>
					</Row>
					<Container className="container-table-activity-log">
						<Row className="row-input">
							<Form>
								<FormGroup row className="fg-period">
									<Label for="dateFrom" sm={1}>
										From
									</Label>
									<Col sm={3} className="col-input">
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
									<Col sm={3} className="col-input">
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
						<Table className="table-activity-log">
							<thead>
								<tr>
									<th
										className={isSortByTimestampAsc ? "sort_asc" : "sort_desc"}
										onClick={this.toggleSortByTimestamp}
									>
										Timestamp
									</th>
									<th>Username</th>
									<th>User Type</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{lsActivity.map((d) => (
									<tr></tr>
								))}
							</tbody>
						</Table>
					</Container>
				</Container>
			</div>
		);
	}
}

export default ActivityLog;
