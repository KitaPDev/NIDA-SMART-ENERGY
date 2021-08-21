import React from "react";
import "./BarChartSystemPowerConsumption.css";

import { Chart, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-moment";

//Custom Tooltip
const getOrCreateTooltip = (chart) => {
	let tooltipEl = chart.canvas.parentNode.querySelector("div");

	if (!tooltipEl) {
		tooltipEl = document.createElement("div");
		tooltipEl.style.background = "rgba(0, 0, 0, 0.7)";
		tooltipEl.style.borderRadius = "3px";
		tooltipEl.style.color = "white";
		tooltipEl.style.opacity = 1;
		tooltipEl.style.position = "absolute";
		tooltipEl.style.transform = "translate(-120%, -50%)";
		tooltipEl.style.transition = "all .1s ease";
		tooltipEl.style.zIndex = "99999";

		const table = document.createElement("table");
		table.style.margin = "0px";

		tooltipEl.appendChild(table);
		chart.canvas.parentNode.appendChild(tooltipEl);
	}

	return tooltipEl;
};

const externalTooltipHandler = (context) => {
	// Tooltip Element
	const { chart, tooltip } = context;
	const tooltipEl = getOrCreateTooltip(chart);

	// Hide if no tooltip
	if (tooltip.opacity === 0) {
		tooltipEl.style.opacity = 0;
		return;
	}

	// Set Text
	if (tooltip.body) {
		const titleLines = tooltip.title || [];

		const bodyLines = tooltip.body.map((b) => {
			return b.lines;
		});

		const tableHead = document.createElement("thead");

		titleLines.forEach((title) => {
			const tr = document.createElement("tr");
			tr.style.borderWidth = 0;

			const th = document.createElement("th");
			th.style.borderWidth = 0;
			const text = document.createTextNode(title);

			th.appendChild(text);
			tr.appendChild(th);
			tableHead.appendChild(tr);
		});

		const tableBody = document.createElement("tbody");
		bodyLines.forEach((body, i) => {
			const colors = tooltip.labelColors[i];

			const span = document.createElement("span");
			span.style.background = colors.backgroundColor;
			span.style.borderColor = colors.borderColor;
			span.style.borderWidth = "2px";
			span.style.marginRight = "10px";
			span.style.height = "10px";
			span.style.width = "10px";
			span.style.display = "inline-block";

			const tr = document.createElement("tr");
			tr.style.backgroundColor = "inherit";
			tr.style.borderWidth = 0;

			const td = document.createElement("td");
			td.style.borderWidth = 0;

			const text = document.createTextNode(body);

			td.appendChild(span);
			td.appendChild(text);
			tr.appendChild(td);
			tableBody.appendChild(tr);
		});

		const tableRoot = tooltipEl.querySelector("table");

		// Remove old children
		while (tableRoot.firstChild) {
			tableRoot.firstChild.remove();
		}

		// Add new children
		tableRoot.appendChild(tableHead);
		tableRoot.appendChild(tableBody);
	}

	const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;

	// Display, position, and set styles for font
	tooltipEl.style.opacity = 1;
	tooltipEl.style.left = positionX + tooltip.caretX + "px";
	tooltipEl.style.top = positionY + tooltip.caretY + "px";
	tooltipEl.style.font = tooltip.options.bodyFont.string;
	tooltipEl.style.padding =
		tooltip.options.padding + "px " + tooltip.options.padding + "px";
};

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
						external: externalTooltipHandler, // Use external instead
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
