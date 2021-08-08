import React, { PureComponent } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#696665", "#ff9233"];

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

export default class PieChartEnergySource extends PureComponent {
	render() {
		let data = [
			{ name: "MEA", value: Math.abs(this.props.mea) },
			{ name: "Solar Cells", value: Math.abs(this.props.solar) },
		];

		return (
			<ResponsiveContainer width="100%" height="100%">
				<PieChart width={400} height={400}>
					<Pie
						isAnimationActive={false}
						data={data}
						cx="50%"
						cy="50%"
						labelLine={false}
						label={renderCustomizedLabel}
						outerRadius={50}
						fill="#8884d8"
						dataKey="value"
					>
						{data.map((entry, index) => (
							<Cell
								key={`cell-${index}`}
								fill={COLORS[index % COLORS.length]}
							/>
						))}
					</Pie>
				</PieChart>
			</ResponsiveContainer>
		);
	}
}
