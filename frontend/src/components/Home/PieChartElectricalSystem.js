import React, { PureComponent } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

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
	index,
}) => {
	const radius = innerRadius + (outerRadius - innerRadius) * 0.4;
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
		"TODAY 00:00 - " + new Date().getHours() + ":" + new Date().getMinutes()
	);
};

const getLine2 = (building, ac, others) => {
	let totalEnergyConsumption = ac + others;

	return building + " " + numberWithCommas(totalEnergyConsumption) + " kWh";
};

const getLine3 = (ac, others) => {
	let percentAC = Math.round((ac / (ac + others)) * 100);

	return "AHU " + percentAC + "% " + numberWithCommas(ac) + " kWh";
};

const getLine4 = (ac, others) => {
	let percentOthers = Math.round((others / (ac + others)) * 100);

	return "Others " + percentOthers + "% " + numberWithCommas(others) + " kWh";
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
				<p style={{ marginBottom: 0, fontSize: "125%", fontWeight: "bold" }}>
					{getLine1()}
				</p>
				<p style={{ marginBottom: 0, fontSize: "125%", fontWeight: "bold" }}>
					{getLine2(building, ac, others)}
				</p>
				<p style={{ marginBottom: 0, color: "#3c67be", fontWeight: "600" }}>
					{getLine3(ac, others)}
				</p>
				<p style={{ marginBottom: 0, color: "#be4114", fontWeight: "600" }}>
					{getLine4(ac, others)}
				</p>
			</div>
		);
	}

	return null;
};

class PieChartElectricalSystem extends PureComponent {
	render() {
		const data = [
			{ name: "A/C", value: this.props.ac },
			{ name: "Others", value: this.props.others },
		];

		return (
			<ResponsiveContainer width="100%" height="100%">
				<PieChart width={400} height={400}>
					<Pie
						dataKey="value"
						isAnimationActive={false}
						data={data}
						cx="50%"
						cy="50%"
						outerRadius={80}
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
						position={{ x: 250, y: 100 }}
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

export default PieChartElectricalSystem;
