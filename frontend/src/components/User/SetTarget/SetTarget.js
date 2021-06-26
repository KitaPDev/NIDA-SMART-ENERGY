import React from "react";
import "./SetTarget.css";
import {
	Row,
	Col,
	Container,
	Form,
	FormGroup,
	Label,
	Input,
	Button,
	Table,
} from "reactstrap";
import { MdPeople } from "react-icons/md";
import http from "../../../httpService";

class SetTarget extends React.Component {
	constructor(props) {
		super(props);

		let lsMonth = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];

		this.state = {
			lsMonth: lsMonth,
			lsBuilding: [],
			lastMonthTarget: 0,
			lastMonthActual: 0,
			lastYearTarget: 0,
			lastYearActual: 0,
			monthAverage: 0,
			yearAverage: 0,
		};

		this.getAllBuildings = this.getAllBuildings.bind(this);
	}

	componentDidMount() {
		this.getAllBuildings();
	}

	async getAllBuildings() {
		try {
			let resp = await http.get("/building/all");

			this.setState({ lsBuilding: resp.data });
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	render() {
		let { lsMonth, lsBuilding } = this.state;

		let currentYear = new Date().getFullYear();
		let end = currentYear + 20;
		let lsYear = [];
		for (let i = currentYear - 10; i < end; i++) {
			lsYear.push(i);
		}

		return (
			<div className="div-set-target">
				<Container className="container-set-target" fluid>
					<Row className="heading">Set Target</Row>
					<Container fluid>
						<Row>
							<Col sm={4}>
								{/* ******************************** CONFIG PANE ******************************** */}
								<Row className="row-config">
									<Form className="form-target">
										<FormGroup row className="fg-config-1">
											<Label for="month" sm={2} className="col-label">
												Month
											</Label>
											<Col sm={4}>
												<Input
													type="select"
													name="month"
													id="monthSelect"
													value={lsMonth[new Date().getMonth()]}
												>
													{lsMonth.map((month, index) => (
														<option>{month}</option>
													))}
												</Input>
											</Col>
											<Label for="year" sm={2} className="col-label">
												Year
											</Label>
											<Col sm={4}>
												<Input
													type="select"
													name="year"
													id="yearSelect"
													value={new Date().getFullYear()}
												>
													{lsYear.map((year) => (
														<option>{year}</option>
													))}
												</Input>
											</Col>
										</FormGroup>
										<FormGroup row className="fg-config-building">
											<Label for="building" sm={2} className="col-label">
												Building
											</Label>
											<Col sm={4}>
												<Input
													type="select"
													name="building"
													id="buildingSelect"
												>
													{lsBuilding.map((building) => (
														<option>{building.label}</option>
													))}
												</Input>
											</Col>
											<Label
												for="amountPeople"
												sm={2}
												style={{
													color: "black",
													width: "fit-content",
												}}
											>
												People
											</Label>
											<Col sm={4}>
												<Input
													type="number"
													name="amountPeople"
													id="amountPeople"
													min="0"
													placeholder="Enter Amount"
													autoComplete="off"
												/>
											</Col>
										</FormGroup>
										<FormGroup row className="fg-config-bill">
											<Label for="amountBill" sm={4} className="col-label">
												Electricity Bill (THB)
											</Label>
											<Col sm={6}>
												<Input
													list="presets"
													type="number"
													name="amountBill"
													id="amountBill"
													min="0"
													placeholder="Enter Amount"
													autoComplete="off"
												/>
												<datalist id="presets">
													<option label="Last Month Target" value={2} />
													<option label="Last Month Actual" value={2} />
													<option label="Last Year Target" value={2} />
													<option label="Last Year Actual" value={2} />
													<option label="Month Average" value={2} />
													<option label="Year Average" value={2} />
												</datalist>
											</Col>
											<Col sm={2} style={{ fontWeight: "600", margin: "auto" }}>
												Baht
											</Col>
										</FormGroup>
										<FormGroup row>
											<Col sm={6} className="col-note">
												<span
													style={{
														textDecoration: "underline",
														alignSelf: "flex-end",
														width: "fit-content",
														paddingRight: 0,
													}}
												>
													*Note:
												</span>
												<span
													style={{
														alignSelf: "flex-end",
														marginLeft: "0.2rem",
														width: "fit-content",
														paddingLeft: 0,
													}}
												>
													Electricity bill is estimated
												</span>
											</Col>
											<Col sm={4} className="col-btn-set-target">
												<Button className="btn-set-target">Set</Button>
											</Col>
										</FormGroup>
									</Form>
								</Row>
								{/* ******************************** BUILDING USERS PANE ******************************** */}
								<Row className="row-building-users">
									<Row className="row-building-users-heading">
										Building Users
									</Row>
									<Form>
										<FormGroup row className="fg-bu-1">
											<Label for="month" sm={2} className="col-label">
												Month
											</Label>
											<Col sm={4}>
												<Input
													type="select"
													name="month"
													id="monthSelect"
													value={lsMonth[new Date().getMonth()]}
												>
													{lsMonth.map((month, index) => (
														<option>{month}</option>
													))}
												</Input>
											</Col>
											<Label for="year" sm={2} className="col-label">
												Year
											</Label>
											<Col sm={4}>
												<Input
													type="select"
													name="year"
													id="yearSelect"
													value={new Date().getFullYear()}
												>
													{lsYear.map((year) => (
														<option>{year}</option>
													))}
												</Input>
											</Col>
										</FormGroup>
									</Form>
									<Table>
										<tbody>
											{lsBuilding.map((building) => (
												<tr>
													<th>
														<div
															className="building-color"
															style={{
																backgroundColor: building.color_code,
															}}
														></div>
													</th>
													<td>{building.label}</td>
													<td>0</td>
												</tr>
											))}
										</tbody>
									</Table>
								</Row>
							</Col>
							<Col sm={8}></Col>
						</Row>
					</Container>
				</Container>
			</div>
		);
	}
}

export default SetTarget;
