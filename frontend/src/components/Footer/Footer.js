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
							<Col sm="6" className="col-left">
								Copyright © 2021 KNP Global Group Co., Ltd.
							</Col>
							<Col sm="6" className="col-right">
								<li>
									<a
										href="https://facebook.com/frenchiebabiesofficial"
										target="_blank"
										rel="noreferrer"
									>
										Facebook
									</a>
									<a
										href="https://instagram.com/frenchiebabiesofficial"
										target="_blank"
										rel="noreferrer"
									>
										Instagram
									</a>
									<a
										href="https://youtube.com/channel/UCfF3uVVKB8XrjbgmwPDHcJQ"
										target="_blank"
										rel="noreferrer"
									>
										YouTube
									</a>
									<a
										href="https://youtube.com/channel/UCfF3uVVKB8XrjbgmwPDHcJQ"
										target="_blank"
										rel="noreferrer"
									>
										LINE
									</a>
								</li>
							</Col>
						</Row>
					</Container>
				</footer>
			</div>
		);
	}
}

export default Footer;
