import React, { PureComponent } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./PieChartSystem.css";

import i18n from "../../../i18n";

const COLORS = ["#3c67be", "#be4114"];

const numberWithCommas = (x) => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
	cx,
	cy,
	midAngle,
	innerRadius,
	outerRadius,
	percent,
}) => {
	const radius = innerRadius + (outerRadius - innerRadius) * 0.2;
	const x = cx + radius * Math.cos(-midAngle * RADIAN);
	const y = cy + radius * Math.sin(-midAngle * RADIAN);

	return (
		<text
			x={x}
			y={y}
			fill="white"
			textAnchor={x > cx ? "start" : "end"}
			dominantBaseline="central"
			fontWeight="600"
		>
			{`${(percent * 100).toFixed(0)}%`}
		</text>
	);
};

const getLine1 = () => {
	return (
		i18n.t("TODAY") +
		" 00:00 - " +
		new Date().toLocaleString([], {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		})
	);
};

const getLine2 = (building, ac, others) => {
	let totalEnergyConsumption = ac + others;

	return (
		building +
		" " +
		numberWithCommas(Math.round(totalEnergyConsumption)) +
		" " +
		i18n.t("kWh")
	);
};

const getLine3 = (ac, others) => {
	let percentAC = Math.round((ac / (ac + others)) * 100);

	return (
		i18n.t("Air Conditioner") +
		" " +
		percentAC +
		"% " +
		numberWithCommas(Math.round(ac)) +
		" " +
		i18n.t("kWh")
	);
};

const getLine4 = (ac, others) => {
	let percentOthers = Math.round((others / (ac + others)) * 100);

	return (
		i18n.t("Others") +
		" " +
		percentOthers +
		"% " +
		numberWithCommas(Math.round(others)) +
		" " +
		i18n.t("kWh")
	);
};

const CustomTooltip = ({ active, label, ...props }) => {
	if (active) {
		let building = props.building;
		let ac = props.ac;
		let others = props.others;

		return (
			<div
				style={{
					backgroundColor: "#F0F0F0",
					borderRadius: "1rem",
					padding: "1rem",
				}}
			>
				<p style={{ marginBottom: 0, fontWeight: "bold" }}>{getLine1()}</p>
				<p style={{ marginBottom: 0, fontWeight: "bold" }}>
					{getLine2(building, ac, others)}
				</p>
				<p
					style={{
						marginBottom: 0,
						color: "#3c67be",
						fontSize: "90%",
						fontWeight: "600",
					}}
				>
					{getLine3(ac, others)}
				</p>
				<p
					style={{
						marginBottom: 0,
						color: "#be4114",
						fontSize: "90%",
						fontWeight: "600",
					}}
				>
					{getLine4(ac, others)}
				</p>
			</div>
		);
	}

	return null;
};

class PieChartSystem extends PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			ac: 0,
			others: 0,
		};
	}

	componentDidUpdate(prevProps) {
		if (
			this.props.ac === prevProps.ac &&
			this.props.others === prevProps.others
		)
			return;

		this.setState({
			ac: this.props.ac,
			others: this.props.others,
		});
	}

	render() {
		let { ac, others } = this.state;

		const data = [
			{ name: "Air Conditioner", value: ac },
			{ name: "Others", value: others },
		];

		return (
			<ResponsiveContainer width="100%" height="100%">
				<PieChart width={400} height={400}>
					<Pie
						isAnimationActive={false}
						dataKey="value"
						data={data}
						cx="50%"
						cy="50%"
						outerRadius={49}
						fill="#8884d8"
						label={renderCustomizedLabel}
						labelLine={false}
					>
						{data.map((entry, index) => (
							<Cell
								key={`cell-${index}`}
								fill={COLORS[index % COLORS.length]}
							/>
						))}
					</Pie>
					<Tooltip
						position={{ x: 210, y: 50 }}
						content={
							<CustomTooltip
								building={this.props.building}
								ac={this.props.ac}
								others={this.props.others}
							/>
						}
					/>
				</PieChart>
			</ResponsiveContainer>
		);
	}
}

export default PieChartSystem;
