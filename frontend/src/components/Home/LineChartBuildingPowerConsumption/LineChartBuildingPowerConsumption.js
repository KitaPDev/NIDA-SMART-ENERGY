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
import "./LineChartBuildingPowerConsumption.css";

const numberWithCommas = (x) => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getAxisYDomain = (series, from, to, ref, offset) => {
	let dateFrom = new Date(from);
	let dateTo = new Date(to);

	let bottom = -1;
	let top = -1;

	for (let set of series) {
		for (let data of set.data) {
			let dateLog = new Date(data.log_datetime);

			if (
				dateLog.getTime() > dateFrom.getTime() &&
				dateLog.getTime() < dateTo.getTime()
			) {
				if (bottom === -1) {
					bottom = data.total;
				} else if (bottom > data.total) {
					bottom = data.total;
				}

				if (top === -1) {
					top = data.total;
				} else if (top < data.total) {
					top = data.total;
				}
			}
		}
	}

	// const refData = series.slice(from - 1, to);
	// let [bottom, top] = [refData[0][ref], refData[0][ref]];
	// refData.forEach((d) => {
	// 	if (d[ref] > top) top = d[ref];
	// 	if (d[ref] < bottom) bottom = d[ref];
	// });

	return [(bottom | 0) - offset, (top | 0) + offset];
};

const getLine1 = (log_datetime) => {
	return new Date(log_datetime).toLocaleString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
};

const getLine2 = (building, percentage) => {
	return building.toUpperCase() + " " + percentage + "%";
};

const getLine3Left = (total) => {
	return total + " kW ";
};

const getLine3Middle = (total, ac) => {
	let percentAC = Math.round((ac / total) * 100);

	return " AHU " + percentAC + "% " + numberWithCommas(ac) + " kW";
};

const getLine3Right = (total, others) => {
	let percentOthers = Math.round((others / total) * 100);

	return "Others " + percentOthers + "% " + numberWithCommas(others) + " kW";
};

const CustomTooltip = ({ payload, active, label, ...props }) => {
	if (active && payload && payload.length > 0) {
		let buildingData = payload[0].payload;

		let dateLog = new Date(buildingData.log_datetime);
		let building = payload[0].name;
		let total = buildingData.total;
		let ac = buildingData.ac;
		let others = buildingData.others;
		let series = props.series;

		let allBuildingsTotal = 0;
		for (let set of series) {
			for (let data of set.data) {
				if (new Date(data.log_datetime).getTime() === dateLog.getTime()) {
					allBuildingsTotal += data.total;
				}
			}
		}

		let percentage = Math.round((total / allBuildingsTotal) * 100);

		return (
			<div
				style={{
					backgroundColor: "#F0F0F0",
					borderRadius: "1rem",
					padding: "1rem",
					paddingBottom: "0.5rem",
				}}
			>
				<p style={{ marginBottom: 0, fontWeight: "bold" }}>
					{getLine1(dateLog)}
				</p>
				<p style={{ marginBottom: 0, fontWeight: "bold" }}>
					{getLine2(building, percentage)}
				</p>
				<p>
					<span
						style={{
							marginBottom: 0,
							color: "#944B50",
							fontSize: "90%",
							fontWeight: "600",
						}}
					>
						{getLine3Left(total)}
					</span>
					{" ; "}
					<span
						style={{
							marginBottom: 0,
							color: "#3c67be",
							fontSize: "90%",
							fontWeight: "600",
						}}
					>
						{getLine3Middle(total, ac)}
					</span>
					,
					<span
						style={{
							marginBottom: 0,
							color: "#be4114",
							fontSize: "90%",
							fontWeight: "600",
						}}
					>
						{" "}
						{getLine3Right(total, others)}
					</span>
				</p>
			</div>
		);
	}

	return null;
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

		let series = [];
		let powerMin = -1;
		let powerMax = -1;
		let dateBegin;
		let dateEnd;

		for (let building of Object.keys(lsLogPower_Building)) {
			let buildingData = {};
			buildingData.building = building;

			let data = [];

			for (let logPower of lsLogPower_Building[building]) {
				let tmp = {};

				let total = logPower.ac + logPower.others;
				let dateLog = new Date(logPower.log_timestamp);

				tmp.log_datetime = dateLog;
				tmp.total = total;
				tmp.ac = logPower.ac;
				tmp.others = logPower.others;

				if (powerMin === -1) {
					powerMin = total;
				} else if (powerMin > total) {
					powerMin = total;
				}

				if (powerMax === -1) {
					powerMax = total;
				} else if (powerMax < total) {
					powerMax = total;
				}

				if (dateBegin === undefined) {
					dateBegin = dateLog;
				} else if (dateBegin > dateLog) {
					dateBegin = dateLog;
				}

				if (dateEnd === undefined) {
					dateEnd = dateLog;
				} else if (dateEnd < dateLog) {
					dateEnd = dateLog;
				}

				data.push(tmp);
			}

			buildingData.data = data;

			series.push(buildingData);
		}

		this.state.series = series;
		this.state.bottom = powerMin;
		this.state.top = powerMax;
		this.state.left = dateBegin;
		this.state.right = dateEnd;

		this.getColorCode = this.getColorCode.bind(this);
		this.formatXAxis = this.formatXAxis.bind(this);
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

	zoom() {
		let { refAreaLeft, refAreaRight } = this.state;
		const { series } = this.state;

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
			this.state.series,
			refAreaLeft,
			refAreaRight,
			"total",
			15
		);

		this.setState(() => ({
			refAreaLeft: "",
			refAreaRight: "",
			series: series.slice(),
			left: refAreaLeft,
			right: refAreaRight,
			bottom,
			top,
		}));
	}

	zoomOut() {
		let { series } = this.state;

		let powerMin = -1;
		let powerMax = -1;
		let dateBegin;
		let dateEnd;

		for (let set of series) {
			for (let data of set.data) {
				let total = data.ac + data.others;
				let dateLog = new Date(data.log_datetime);

				if (powerMin === -1) {
					powerMin = total;
				} else if (powerMin > total) {
					powerMin = total;
				}

				if (powerMax === -1) {
					powerMax = total;
				} else if (powerMax < total) {
					powerMax = total;
				}

				if (dateBegin === undefined) {
					dateBegin = dateLog;
				} else if (dateBegin > dateLog) {
					dateBegin = dateLog;
				}

				if (dateEnd === undefined) {
					dateEnd = dateLog;
				} else if (dateEnd < dateLog) {
					dateEnd = dateLog;
				}
			}
		}

		this.setState(() => ({
			series: series.slice(),
			refAreaLeft: "",
			refAreaRight: "",
			left: dateBegin,
			right: dateEnd,
			top: powerMax + 2,
			bottom: powerMin - 2,
		}));
	}

	formatXAxis(tickItem) {
		return new Date(tickItem).toLocaleString([], {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	}

	render() {
		let { series, left, right, refAreaLeft, refAreaRight, top, bottom } =
			this.state;

		return (
			<div
				className="highlight-bar-charts"
				style={{ userSelect: "none", width: "100%" }}
			>
				<Row>
					<Col sm={10} style={{ paddingLeft: 0, paddingRight: 0 }}>
						<ResponsiveContainer width="100%" height={150}>
							<LineChart
								width={560}
								height={200}
								margin={{ left: 0, right: 18 }}
								onMouseDown={(e) =>
									e.chartX !== undefined
										? this.setState({ refAreaLeft: e.activeLabel })
										: ""
								}
								onMouseMove={(e) =>
									e.chartX !== undefined
										? this.state.refAreaLeft !== "" &&
										  this.setState({ refAreaRight: e.activeLabel })
										: ""
								}
								// eslint-disable-next-line react/jsx-no-bind
								onMouseUp={this.zoom.bind(this)}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis
									allowDataOverflow={true}
									allowDuplicatedCategory={false}
									dataKey="log_datetime"
									domain={[left, right]}
									scale="time"
									tickFormatter={this.formatXAxis}
									interval={0}
									fontSize="80%"
								/>
								<YAxis
									allowDataOverflow={true}
									domain={[bottom - 2, top + 2]}
									yAxisId="1"
									fontSize="80%"
								/>
								<Tooltip
									position={{ x: 500, y: 100 }}
									content={<CustomTooltip series={series} />}
								/>
								{series.map((s) => (
									<Line
										yAxisId="1"
										type="natural"
										dataKey="total"
										data={s.data}
										name={s.building}
										key={s.building}
										stroke={this.getColorCode(s.building)}
										animationDuration={300}
										dot={false}
										strokeWidth={2}
									/>
								))}

								{refAreaLeft !== "" && refAreaRight !== "" ? (
									<ReferenceArea
										yAxisId="1"
										x1={refAreaLeft.getTime()}
										x2={refAreaRight.getTime()}
										strokeOpacity={0.5}
									/>
								) : null}

								<Legend layout="vertical" verticalAlign="top" align="center" />
							</LineChart>
						</ResponsiveContainer>
					</Col>
					<Col
						sm={2}
						style={{
							margin: "auto",
						}}
					>
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
