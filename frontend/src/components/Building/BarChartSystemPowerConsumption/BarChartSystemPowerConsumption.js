import React from "react";
import "./BarChartSystemPowerConsumption.css";

import { Chart, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-moment";

import tooltipHandler from "../../../utils/tooltipHandler";

let barChart;

class BarChartSystemPowerConsumption extends React.Component {
	constructor(props) {
		super(props);

		let today = new Date();
		let xMin = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate(),
			0,
			0,
			0,
			0
		);

		this.state = {
			// Chart details
			data: {},
			options: {
				responsive: true,
				animation: false,
				maintainAspectRatio: false,
				interaction: {
					intersect: false,
					axis: "xy",
					mode: "index",
				},
				scales: {
					xAxis: {
						type: "time",
						time: {
							displayFormats: {
								millisecond: "HH:mm:ss.SSS",
								second: "HH:mm:ss",
								minute: "HH:mm",
								hour: "HH:mm",
							},
						},
						grid: {
							display: false,
						},
					},
					yAxis: {
						min: 0,
						max: 100,
						display: true,
						grid: {
							display: true,
						},
					},
				},
				plugins: {
					title: {
						display: false,
					},
					legend: {
						display: false,
					},
					tooltip: {
						enabled: false,
						external: tooltipHandler.tooltipHandlerRightDec,
					},
					zoom: {
						pan: {
							enabled: true,
							mode: "xy",
						},
						zoom: {
							wheel: { enabled: true },
							pinch: { enabled: true },
							mode: "xy",
							speed: 100,
						},
						limits: {
							x: { min: xMin, max: today },
							y: { min: "original", max: "original" },
						},
					},
				},
			},
		};

		this.handleDoubleClick = this.handleDoubleClick.bind(this);
	}

	buildChart = () => {
		let { data, options } = this.state;

		document.getElementById("bc-system-power").remove();
		document.getElementById(
			"wrapper-bc-system-power"
		).innerHTML = `<canvas id="bc-system-power" />`;

		let ctx = document.getElementById("bc-system-power").getContext("2d");

		barChart = new Chart(ctx, {
			type: "bar",
			data: data,
			options: options,
		});
	};

	componentDidMount() {
		Chart.register(...registerables);
		Chart.register(zoomPlugin);
	}

	componentWillReceiveProps(nextProps) {
		let { data, options } = this.state;

		let lsLogKw_system = nextProps.lsLogKw_system;
		if (lsLogKw_system === undefined) return;
		if (
			JSON.stringify(this.props.lsLogKw_system) ===
				JSON.stringify(nextProps.lsLogKw_system) &&
			this.props.system === nextProps.system
		)
			return;

		let system = nextProps.system;
		let color = nextProps.color;

		let datasets = [];

		let labels = [];
		let lsKw_system = {};
		let yMax = 0;

		let prevDatetime;
		for (let [sys, lsLog] of Object.entries(lsLogKw_system)) {
			if (lsKw_system[sys] === undefined) lsKw_system[sys] = [];
			let lsKw = lsKw_system[sys];

			for (let log of lsLog) {
				let datetime = new Date(log.datetime);
				let kw = log.kw;

				if (
					labels.findIndex((d) => d.getTime() === datetime.getTime()) === -1
				) {
					labels.push(new Date(datetime));
				}

				if (prevDatetime) {
					if (datetime.getTime() === prevDatetime.getTime()) {
						lsKw[lsKw.length - 1] += kw;

						if (lsKw[lsKw.length - 1] > yMax) yMax = lsKw[lsKw.length - 1];
					} else lsKw.push(kw);
				} else lsKw.push(kw);

				if (kw > yMax) yMax = kw;

				prevDatetime = datetime;
			}
		}

		let lsKw = [];
		if (lsKw_system["Main"] !== undefined) lsKw = lsKw_system["Main"];
		if (system === "Air Conditioner") lsKw = lsKw_system["Air Conditioner"];
		else if (system === "Others") {
			if (lsKw_system["Air Conditioner"] !== undefined) {
				lsKw.forEach((_, idx) => {
					lsKw[idx] -= lsKw_system["Air Conditioner"][idx];
				});
			}
		}

		let dataset = {
			label: system,
			backgroundColor: color,
			borderColor: color,
			data: lsKw,
		};

		datasets.push(dataset);

		data.labels = labels;
		data.datasets = datasets;

		options.scales.xAxis.min = labels[0];
		options.scales.xAxis.max = labels[labels.length - 1];
		options.scales.yAxis.max = yMax;

		this.setState({
			data: data,
			options: options,
		});

		this.buildChart();
	}

	handleDoubleClick() {
		if (barChart) barChart.resetZoom();
	}

	render() {
		return (
			<div id="wrapper-bc-system-power" onDoubleClick={this.handleDoubleClick}>
				<canvas id="bc-system-power" />
			</div>
		);
	}
}

export default BarChartSystemPowerConsumption;
