import React, { PureComponent } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ReferenceLine,
	ResponsiveContainer,
	Cell,
} from "recharts";

const data = [
	{
		name: "Page A",
		uv: 4000,
	},
	{
		name: "Page B",
		uv: -3000,
	},
	{
		name: "Page C",
		uv: -2000,
	},
	{
		name: "Page D",
		uv: 2780,
	},
	{
		name: "Page E",
		uv: -1890,
	},
	{
		name: "Page F",
		uv: 2390,
	},
	{
		name: "Page G",
		uv: 3490,
	},
];

export default class PNBarBillCompareChart extends PureComponent {
	render() {
		return (
			<ResponsiveContainer width="100%" height="100%">
				<BarChart
					width={500}
					height={300}
					data={data}
					margin={{
						top: 5,
						right: 30,
						left: 20,
						bottom: 5,
					}}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip />
					<ReferenceLine y={0} stroke="#000" />
					<Bar dataKey="uv" fill="#8884d8">
						{data.map((entry, index) => (
							<Cell fill={data[index].uv > 0 ? "#B6CEE9" : "#FFAFAF"} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		);
	}
}
