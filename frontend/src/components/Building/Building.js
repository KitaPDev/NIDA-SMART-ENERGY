import React from "react";
import { Container, Row, Col } from "reactstrap";
import "./Building.css";
import { MdPeople } from "react-icons/md";
import { Form, FormGroup, Label, Input } from "reactstrap";

class Building extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.state.lsBuilding = [
			"Auditorium",
			"Bunchana",
			"Chup",
			"Malai",
			"Narathip",
			"Navamin",
			"Nida House",
			"Nidasumpan",
			"Ratchaphruek",
			"Serithai",
			"Siam",
		];

		let building = this.props.building;

		building === undefined
			? (this.state.building = "Auditorium")
			: (this.state.building = building);

		this.state.amountPeople = 30;

		this.getColorCode = this.getColorCode.bind(this);
	}

	getColorCode(building) {
		switch (building.toUpperCase()) {
			case "NAVAMIN":
				return "#BFF0B5";

			case "SIAM":
				return "#FA999A";

			case "BUNCHANA":
				return "#CCEBFF";

			case "NIDA HOUSE":
				return "#DCC87E";

			case "MALAI":
				return "#FFDFB3";

			case "CHUP":
				return "#FFBE7C";

			case "NIDASUMPAN":
				return "#FFECA0";

			case "NARATHIP":
				return "#9BCD95";

			case "RATCHAPHRUEK":
				return "#91C5C2";

			case "SERITHAI":
				return "#B9DFDB";

			case "AUDITORIUM":
				return "#95B2D1";

			default:
				return "#000000";
		}
	}

	render() {
		let { lsBuilding, building, amountPeople } = this.state;
		return (
			<div>
				<Container style={{ padding: "1rem" }} fluid>
					<Row>
						<Col sm={2}>
							<div className="building-list-pane">
								<p id="heading-1">Building</p>
								{lsBuilding.map((bld) => (
									<div>
										<Row
											className="row-building"
											style={{ opacity: bld === building ? 1 : 0.5 }}
											onClick={() => this.setState({ building: bld })}
										>
											<Col sm={2} className="col-square-building">
												<div
													className="square-building"
													style={{
														backgroundColor: this.getColorCode(bld),
													}}
												></div>
											</Col>
											<Col sm={10}>{bld}</Col>
										</Row>
									</div>
								))}
							</div>
						</Col>
						<Col sm={10} style={{ paddingLeft: "1rem" }}>
							<Row>
								<Col sm={5}>
									<Row
										className="row-title"
										style={{ color: this.getColorCode(building) }}
									>
										{building}
									</Row>
									<Row
										className="row-heading"
										style={{ color: this.getColorCode(building) }}
									>
										<p>
											Estimated{" "}
											<span style={{ fontSize: "150%", fontWeight: "bold" }}>
												{amountPeople}
											</span>{" "}
											people{" "}
											<span>
												<MdPeople size="1.5em" style={{ margin: "auto" }} />
											</span>
										</p>
									</Row>
								</Col>
								<Col sm={7}>
									<Row>
										<Form>
											<FormGroup row>
												<Label for="dateFrom" sm={1}>
													From
												</Label>
												<Col sm={5}>
													<Input
														type="date"
														name="date"
														id="dateFrom"
														placeholder="date placeholder"
													/>
												</Col>
												<Label for="dateTo" sm={1}>
													To
												</Label>
												<Col sm={5}>
													<Input
														type="date"
														name="date"
														id="dateTo"
														placeholder="date placeholder"
													/>
												</Col>
											</FormGroup>
										</Form>
									</Row>
								</Col>
							</Row>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default Building;
