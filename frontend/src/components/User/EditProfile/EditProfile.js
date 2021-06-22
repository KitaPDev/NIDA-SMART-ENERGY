import React from "react";
import FormData from "form-data";
import { ImagePicker } from "react-file-picker";
import { Row, Col, Container, Button } from "reactstrap";
import "./EditProfile.css";

class EditProfile extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: "",
			email: "",
			userType: "",
			activatedDate: "",
			lastLogin: "",
			image: "",
		};
	}

	componentDidUpdate(e) {
		console.log(e);
	}

	render() {
		return (
			<div>
				<Container fluid>
					<Row className="heading">User Profile</Row>
					<Row>
						<Col sm={2}>
							<ImagePicker
								extensions={["jpg", "png", "jpeg", "JPG", "PNG", "JPEG"]}
								dims={{
									minWidth: 100,
									maxWidth: 500,
									minHeight: 100,
									maxHeight: 500,
								}}
								onChange={(base64) => this.setState({ image: base64 })}
								onError={(err) => {
									alert(err);
								}}
							>
								<Button>Upload an Image</Button>
							</ImagePicker>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default EditProfile;
