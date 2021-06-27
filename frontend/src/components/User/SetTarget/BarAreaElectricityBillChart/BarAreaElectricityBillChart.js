import React, { PureComponent } from "react";
import {
	ComposedChart,
	Area,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import "./BarAreaElectricityBillChart.css";

const data = [
	{
		name: "Page A",

		pv: 800,
		amt: 1400,
	},
	{
		name: "Page B",

		pv: 967,
		amt: 1506,
	},
	{
		name: "Page C",

		pv: 1098,
		amt: 989,
	},
	{
		name: "Page D",

		pv: 1200,
		amt: 1228,
	},
	{
		name: "Page E",

		pv: 1108,
		amt: 1100,
	},
	{
		name: "Page F",
		pv: 680,
		amt: 1700,
	},
];

export default class BarAreaElectricityBillChart extends PureComponent {
	static demoUrl = "https://codesandbox.io/s/simple-composed-chart-h9zif";

	render() {
		return (
			<ResponsiveContainer width="100%" height="100%">
				<ComposedChart
					width={500}
					height={400}
					data={data}
					margin={{
						top: 20,
						right: 20,
						bottom: 20,
						left: 20,
					}}
				>
					<CartesianGrid stroke="#f5f5f5" />
					<XAxis dataKey="name" scale="band" />
					<YAxis />
					<Tooltip />
					<Area type="monotone" dataKey="amt" fill="#E2E2E2" stroke="#E2E2E2" />
					<Bar dataKey="pv" barSize={20} fill="#FFB800" />
				</ComposedChart>
			</ResponsiveContainer>
		);
	}
}
