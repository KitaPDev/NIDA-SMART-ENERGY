import React, { PureComponent } from "react";
import {
	LineChart,
	Line,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	ReferenceArea,
	ResponsiveContainer,
	Legend,
} from "recharts";
import { Row, Col, Button } from "reactstrap";

const getAxisYDomain = (data, from, to, ref, offset) => {
	const refData = data.slice(from - 1, to);
	let [bottom, top] = [refData[0][ref], refData[0][ref]];
	refData.forEach((d) => {
		if (d[ref] > top) top = d[ref];
		if (d[ref] < bottom) bottom = d[ref];
	});

	return [(bottom | 0) - offset, (top | 0) + offset];
};

export default class LineChartBuildingPowerConsumption extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			refAreaLeft: "",
			refAreaRight: "",
			animation: true,
		};

		let lsLogPower_Building = this.props.lsLogPower_Building;

		let data = [];
		let powerMin = -1;
		let powerMax = -1;
		let timeBegin;
		let timeEnd;

		for (let building of Object.keys(lsLogPower_Building)) {
			for (let logPower of lsLogPower_Building[building]) {
				let tmp = {};

				let overall = logPower.ac + logPower.others;
				let log_datetime = new Date(logPower.log_timestamp);

				tmp[building] = overall;
				tmp.ac = logPower.ac;
				tmp.others = logPower.others;
				tmp.log_datetime = log_datetime;

				if (powerMin === -1) {
					powerMin = overall;
				} else if (powerMin > overall) {
					powerMin = overall;
				}

				if (powerMax === -1) {
					powerMax = overall;
				} else if (powerMax < overall) {
					powerMin = overall;
				}

				if (timeBegin === undefined) {
					timeBegin = log_datetime;
				} else if (timeBegin > log_datetime) {
					timeBegin = log_datetime;
				}

				if (timeEnd === undefined) {
					timeEnd = log_datetime;
				} else if (timeEnd < log_datetime) {
					timeEnd = log_datetime;
				}

				data.push(tmp);
			}
		}

		this.state.data = data;
		this.state.bottom = powerMin;
		this.state.top = powerMax;
		this.state.left = timeBegin;
		this.state.right = timeEnd;

		this.getColorCode = this.getColorCode.bind(this);
	}

	getColorCode(building) {
		switch (building.toUpperCase()) {
			case "NAVAMIN":
				return "#BFF0B5";

			case "SIAM":
				return "#BFF0B5";

			case "BUNCHANA":
				return "#BFF0B5";

			case "NIDA HOUSE":
				return "#BFF0B5";

			case "CHUP":
				return "#BFF0B5";

			case "NIDASUMPAN":
				return "#BFF0B5";

			case "NARATHIP":
				return "#BFF0B5";

			case "RATCHAPHRUEK":
				return "#BFF0B5";

			case "SERITHAI":
				return "#BFF0B5";

			case "AUDITORIUM":
				return "#BFF0B5";

			default:
				return "#000000";
		}
	}

	zoom() {
		let { refAreaLeft, refAreaRight } = this.state;
		const { data } = this.state;

		if (refAreaLeft === refAreaRight || refAreaRight === "") {
			this.setState(() => ({
				refAreaLeft: "",
				refAreaRight: "",
			}));
			return;
		}

		// xAxis domain
		if (refAreaLeft > refAreaRight)
			[refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

		// yAxis domain
		const [bottom, top] = getAxisYDomain(
			this.state.data,
			refAreaLeft,
			refAreaRight,
			"cost",
			1
		);

		this.setState(() => ({
			refAreaLeft: "",
			refAreaRight: "",
			data: data.slice(),
			left: refAreaLeft,
			right: refAreaRight,
			bottom,
			top,
		}));
	}

	zoomOut() {
		const { data } = this.state;
		this.setState(() => ({
			data: data.slice(),
			refAreaLeft: "",
			refAreaRight: "",
			left: "dataMin",
			right: "dataMax",
			top: "dataMax+1",
			bottom: "dataMin",
			top2: "dataMax+50",
			bottom2: "dataMin+50",
		}));
	}

	render() {
		let {
			data,
			barIndex,
			left,
			right,
			refAreaLeft,
			refAreaRight,
			top,
			bottom,
		} = this.state;

		let lsBuilding = Object.keys(this.props.lsLogPower_Building);

		return (
			<div
				className="highlight-bar-charts"
				style={{ userSelect: "none", width: "100%" }}
			>
				<Row>
					<Col sm={10}>
						<ResponsiveContainer width="100%" height={200}>
							<LineChart
								data={data}
								onMouseDown={(e) =>
									this.setState({ refAreaLeft: e.activeLabel })
								}
								onMouseMove={(e) =>
									this.state.refAreaLeft &&
									this.setState({ refAreaRight: e.activeLabel })
								}
								// eslint-disable-next-line react/jsx-no-bind
								onMouseUp={this.zoom.bind(this)}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis
									allowDataOverflow
									dataKey="log_datetime"
									domain={[left, right]}
									type="number"
								/>
								<YAxis
									allowDataOverflow
									domain={[bottom, top]}
									type="number"
									yAxisId="1"
								/>
								<Tooltip />
								{lsBuilding.map((building) => (
									<Line
										yAxisId="1"
										type="natural"
										dataKey={building}
										stroke={this.getColorCode(building)}
										animationDuration={300}
									/>
								))}

								{refAreaLeft && refAreaRight ? (
									<ReferenceArea
										yAxisId="1"
										x1={refAreaLeft}
										x2={refAreaRight}
										strokeOpacity={0.3}
									/>
								) : null}
								<Legend layout="vertical" verticalAlign="top" align="center" />
							</LineChart>
						</ResponsiveContainer>
					</Col>
					<Col sm={2} style={{ margin: "auto" }}>
						<Button
							style={{ fontSize: "80%" }}
							outline
							color="primary"
							onClick={this.zoomOut.bind(this)}
						>
							Zoom Out
						</Button>
					</Col>
				</Row>
			</div>
		);
	}
}
