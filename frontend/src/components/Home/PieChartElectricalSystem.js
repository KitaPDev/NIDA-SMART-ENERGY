import React, { PureComponent } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default class PieChartElectricalSystem extends PureComponent {
	renderCustomizedLabel = ({
		cx,
		cy,
		midAngle,
		innerRadius,
		outerRadius,
		percent,
		index,
	}) => {
		const RADIAN = Math.PI / 180;
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

	getIntroOfPage = () => {
		let totalEnergyConsumption = this.props.ac + this.props.others;

		return (
			"TODAY 00:00 - " +
			new Date().getHours() +
			":" +
			new Date().getMinutes() +
			"\n" +
			this.props.building +
			" " +
			totalEnergyConsumption +
			" kWh"
		);
	};

	CustomTooltip = ({ active, payload, label }) => {
		let totalEnergyConsumption = this.props.ac + this.props.others;
		let ahuPercentage = (this.props.ac / totalEnergyConsumption) * 100;
		let othersPercentage = (this.props.others / totalEnergyConsumption) * 100;

		if (active && payload && payload.length) {
			return (
				<div className="custom-tooltip">
					<p className="intro">{this.getIntroOfPage()}</p>
					<p className="desc">
						<span>
							AHU {ahuPercentage}% {this.props.ac} kWh
						</span>
						<span>
							Others {othersPercentage}% {this.props.others} kWh
						</span>
					</p>
				</div>
			);
		}

		return null;
	};

	render() {
		let data = [
			{ name: "A/C", value: this.props.ac },
			{ name: "Others", value: this.props.others },
		];

		let COLORS = ["#3c67be", "#be4114"];

		return (
			<ResponsiveContainer width="100%" height="100%">
				<PieChart width={400} height={400}>
					<Pie
						data={data}
						cx="50%"
						cy="50%"
						labelLine={false}
						label={this.renderCustomizedLabel}
						outerRadius={80}
						fill="#8884d8"
						dataKey="value"
					>
						{data.map((entry, index) => (
							<Cell
								key={`cell-${index}`}
								fill={COLORS[index % COLORS.length]}
							/>
						))}
						<Tooltip />
					</Pie>
				</PieChart>
			</ResponsiveContainer>
		);
	}
}
