import React from "react";
import { Row, Col, Container } from "reactstrap";
import "./Footer.css";

class Footer extends React.Component {
	render() {
		return (
			<div>
				<footer>
					<Container fluid>
						<Row className="align-items-center">
							<Col sm="6" className="col-left"></Col>
							<Col sm="6" className="col-right"></Col>
						</Row>
					</Container>
				</footer>
			</div>
		);
	}
}

export default Footer;
