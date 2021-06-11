import React, { PureComponent } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { Row, Col } from "reactstrap";
import "./BarChartElectricalSystemPowerConsumption.css";

const numberWithCommas = (x) => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const getLine1 = (log_datetime) => {
	return new Date(log_datetime).toLocaleString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
};

const getLine2Left = (total, ac) => {
	let percentAC = Math.round((ac / total) * 100);

	return "A/C " + percentAC + "% " + numberWithCommas(ac) + " kW";
};

const getLine2Right = (total, others) => {
	let percentOthers = Math.round((others / total) * 100);

	return " Others " + percentOthers + "% " + numberWithCommas(others) + " kW";
};

const CustomTooltip = ({ payload, active, label, ...props }) => {
	if (active && payload && payload.length > 0) {
		let data = payload[0].payload;

		let dateLog = new Date(data.dateLog);
		let ac = data.ac + data.others;
		let others = data.others;

		let total = ac + others;

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
					<span style={{ color: "#1797BE" }}>{getLine2Left(total, ac)}</span>,
					<span style={{ color: "#BE4114" }}>
						{getLine2Right(total, others)}
					</span>
				</p>
			</div>
		);
	}

	return null;
};

export default class BarChartElectricalSystemPowerConsumption extends PureComponent {
	constructor(props) {
		super(props);
		this.state = { animation: true };

		let lsLogPower_Building = this.props.lsLogPower_Building;

		let data = [];
		for (let building of Object.keys(lsLogPower_Building)) {
			for (let logPower of lsLogPower_Building[building]) {
				let tmp = {};

				let dateLog = new Date(logPower.log_timestamp);

				tmp.dateLog = dateLog;
				tmp.ac = logPower.ac;
				tmp.others = logPower.others;

				let containsDate = false;
				if (data.length > 0) {
					data.forEach(function (elem, index, data) {
						if (new Date(elem.dateLog).getTime() === tmp.dateLog.getTime()) {
							data[index].ac += tmp.ac;
							data[index].others += tmp.others;
							containsDate = true;
							return;
						}
					});
				}

				if (!containsDate) {
					data.push(tmp);
				}
			}
		}

		this.state.data = data;

		this.getColorCode = this.getColorCode.bind(this);
		this.formatXAxis = this.formatXAxis.bind(this);
	}

	getColorCode(system) {
		switch (system.toUpperCase()) {
			case "AC":
				return "#1797BE";

			case "OTHERS":
				return "#BE4114";

			default:
				return "#000000";
		}
	}

	formatXAxis(tickItem) {
		return new Date(tickItem).toLocaleString([], {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	}

	render() {
		let { data } = this.state;

		data.forEach(function (elem, index, data) {
			data[index].ac -= data[index].others;
		});

		return (
			<Row>
				<Col sm={12}>
					<ResponsiveContainer width="100%" height={150}>
						<BarChart
							width={500}
							height={300}
							data={data}
							margin={{ left: 0, right: 18 }}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis
								allowDataOverflow={true}
								dataKey="dateLog"
								scale="time"
								tickFormatter={this.formatXAxis}
								interval={0}
								fontSize="80%"
							/>
							<YAxis fontSize="80%" />
							<Tooltip
								position={{ x: 500, y: -50 }}
								content={<CustomTooltip />}
							/>
							<Legend layout="vertical" verticalAlign="top" align="center" />
							<Bar
								dataKey="others"
								stackId="a"
								fill={this.getColorCode("others")}
							/>
							<Bar dataKey="ac" stackId="a" fill={this.getColorCode("AC")} />
						</BarChart>
					</ResponsiveContainer>
				</Col>
			</Row>
		);
	}
}
