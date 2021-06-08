import React, { PureComponent } from "react";
import {
	LineChart,
	Line,
	CartesianGrid,
	YAxis,
	Tooltip,
	ReferenceArea,
	ResponsiveContainer,
	Legend,
} from "recharts";
import { Row, Col, Button } from "reactstrap";

const initialData = [
	{ log_timestamp: "", kw: 50.34 },
	{ name: 2, cost: 2.39 },
	{ name: 3, cost: 1.37 },
	{ name: 4, cost: 1.16 },
	{ name: 5, cost: 2.29 },
	{ name: 6, cost: 3 },
	{ name: 7, cost: 0.53 },
	{ name: 8, cost: 2.52 },
	{ name: 9, cost: 1.79 },
	{ name: 10, cost: 2.94 },
	{ name: 11, cost: 4.3 },
	{ name: 12, cost: 4.41 },
	{ name: 13, cost: 2.1 },
	{ name: 14, cost: 8 },
	{ name: 15, cost: 0 },
	{ name: 16, cost: 9 },
	{ name: 17, cost: 3 },
	{ name: 18, cost: 2 },
	{ name: 19, cost: 3 },
	{ name: 20, cost: 7 },
];

const getAxisYDomain = (from, to, ref, offset) => {
	const refData = initialData.slice(from - 1, to);
	let [bottom, top] = [refData[0][ref], refData[0][ref]];
	refData.forEach((d) => {
		if (d[ref] > top) top = d[ref];
		if (d[ref] < bottom) bottom = d[ref];
	});

	return [(bottom | 0) - offset, (top | 0) + offset];
};

const initialState = {
	data: initialData,
	left: "dataMin",
	right: "dataMax",
	refAreaLeft: "",
	refAreaRight: "",
	top: "dataMax+1",
	bottom: "dataMin-1",
	top2: "dataMax+20",
	bottom2: "dataMin-20",
	animation: true,
};

export default class LineChartBuildingPowerConsumption extends PureComponent {
	constructor(props) {
		super(props);
		this.state = initialState;
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
		const [bottom, top] = getAxisYDomain(refAreaLeft, refAreaRight, "cost", 1);
		const [bottom2, top2] = getAxisYDomain(
			refAreaLeft,
			refAreaRight,
			"impression",
			50
		);

		this.setState(() => ({
			refAreaLeft: "",
			refAreaRight: "",
			data: data.slice(),
			left: refAreaLeft,
			right: refAreaRight,
			bottom,
			top,
			bottom2,
			top2,
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
		const {
			data,
			barIndex,
			left,
			right,
			refAreaLeft,
			refAreaRight,
			top,
			bottom,
			top2,
			bottom2,
		} = this.state;

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
								<YAxis
									allowDataOverflow
									domain={[bottom, top]}
									type="number"
									yAxisId="1"
								/>
								<Tooltip />
								<Line
									yAxisId="1"
									type="natural"
									dataKey="cost"
									stroke="#8884d8"
									animationDuration={300}
								/>

								{refAreaLeft && refAreaRight ? (
									<ReferenceArea
										yAxisId="1"
										x1={refAreaLeft}
										x2={refAreaRight}
										strokeOpacity={0.3}
									/>
								) : null}
								<Legend
									layout="vertical"
									verticalAlign="bottom"
									align="center"
								/>
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
