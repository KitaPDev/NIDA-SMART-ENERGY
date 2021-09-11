import React from "react";

import { Chart } from "chart.js";

class PieChartBuildingEnergyUsage extends React.Component {
	buildChart = () => {
		let { lsSelectedBuilding, kwh_system_building, lsBuilding } = this.props;

		let options = {
			animation: false,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: false,
				},
			},
		};

		let lsData = [];
		Object.values(kwh_system_building).forEach((kwh_system) => {
			lsData.push(kwh_system["Main"]);
		});

		let lsColor = [];
		lsSelectedBuilding.forEach(
			(b) => lsBuilding.find((bld) => bld.label === b).color_code
		);

		let data = {
			labels: [...lsSelectedBuilding],
			datasets: [
				{
					data: lsData,
					backgoundColor: lsColor,
				},
			],
		};

		document.getElementById("pc-building-energy-usage").remove();
		document.getElementById(
			"pc-building-energy-usage"
		).innerHTML = `<canvas id="pc-building-energy-usage" />`;

		let ctx = document
			.getElementById("pc-building-energy-usage")
			.getContext("2d");

		new Chart(ctx, {
			type: "pie",
			data: data,
			options: options,
		});
	};

	render() {
		return (
			<div id="pc-building-energy-usage" onDoubleClick={this.handleDoubleClick}>
				<canvas id="pc-building-energy-usage" />
			</div>
		);
	}
}

export default PieChartBuildingEnergyUsage;
