import React from "react";
import "./ActivityLog.css";
import { Container, Row, Col } from "reactstrap";

class ActivityLog extends React.Component {
	render() {
		return (
			<div class="activity-log">
				<Container fluid className="container-activity-log">
					<Row className="heading">Activity Log</Row>
					<Row className="row-input"></Row>
				</Container>
			</div>
		);
	}
}

export default ActivityLog;
