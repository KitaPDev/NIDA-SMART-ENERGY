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
		tooltipEl.style.transform = "translate(20%, -50%)";
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
			lsBuilding: this.props.lsBuilding,
			lsSelectedBuildingPrev: [],
			componentShouldUpdate: true,

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
						stacked: true,
					},
					yAxis: {
						min: 0,
						max: 100,
						display: true,
						grid: {
							display: false,
						},
						stacked: true,
					},
				},
				plugins: {
					legend: {
						display: true,
						position: "top",
						labels: { usePointStyle: true },
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
							speed: 2,
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
		let { data, options, lsSelectedBuildingPrev } = this.state;

		if (
			JSON.stringify(this.props.lsKw_system_building) ===
				JSON.stringify(nextProps.lsKw_system_building) &&
			JSON.stringify(lsSelectedBuildingPrev) ===
				JSON.stringify(nextProps.lsSelectedBuilding) &&
			Object.values(data).length > 0
		) {
			return;
		}

		let lsKw_system_building = {};
		Object.assign(lsKw_system_building, nextProps.lsKw_system_building);

		let lsSelectedBuilding = nextProps.lsSelectedBuilding.slice();

		if (Object.keys(lsKw_system_building).length <= 1) return;

		let labels = [];
		let datasets = [];

		let building_lsKwMain = {};
		let building_lsKwAc = {};

		for (let [building, lsKw_system] of Object.entries(lsKw_system_building)) {
			if (!lsSelectedBuilding.includes(building)) continue;

			if (!building_lsKwMain[building]) building_lsKwMain[building] = [];
			if (!building_lsKwAc[building]) building_lsKwAc[building] = [];

			let lsKwMain = building_lsKwMain[building];
			let lsKwAc = building_lsKwAc[building];

			let prevDatetime;
			for (let logKwMain of lsKw_system["Main"]) {
				let datetime = new Date(logKwMain.datetime);
				let kw = logKwMain.kw;

				if (!labels.find((d) => d.getTime() === datetime.getTime())) {
					labels.push(new Date(datetime));
				}

				if (!lsSelectedBuilding.includes(building)) {
					prevDatetime = datetime;
					continue;
				}

				if (prevDatetime) {
					if (datetime.getTime() === prevDatetime.getTime()) {
						lsKwMain[lsKwMain.length - 1] += kw;
					} else lsKwMain.push(kw);
				} else lsKwMain.push(kw);

				prevDatetime = datetime;
			}

			// Fill AC array with zeroes if no AC kw readings
			if (!lsKw_system["Air Conditioner"]) {
				let lengthDiff = lsKwMain.length - lsKwAc.length;
				building_lsKwAc[building] = lsKwAc.concat(Array(lengthDiff).fill(0));
				continue;
			}

			for (let logKwAc of lsKw_system["Air Conditioner"]) {
				let datetime = new Date(logKwAc.datetime);
				let kw = logKwAc.kw;

				if (prevDatetime) {
					if (datetime.getTime() === prevDatetime.getTime()) {
						lsKwAc[lsKwAc.length - 1] += kw;
					} else lsKwAc.push(kw);
				} else lsKwAc.push(kw);

				prevDatetime = datetime;
			}
		}

		let lsKwOthers = [];
		let lsKwAc = [];

		let yMax = 0;
		for (let [building, lsKwMain] of Object.entries(building_lsKwMain)) {
			lsKwMain.forEach((kwMain, idx) => {
				if (!lsKwOthers[idx]) lsKwOthers[idx] = 0;
				lsKwOthers[idx] += kwMain;

				if (lsKwOthers[idx] > yMax) yMax = lsKwOthers[idx];
			});

			building_lsKwAc[building].forEach((kwAc, idx) => {
				if (!lsKwAc[idx]) lsKwAc[idx] = 0;
				lsKwAc[idx] += kwAc;
			});
		}

		lsKwAc.forEach(
			(kwAc, idx) => (lsKwOthers[idx] = Math.abs(lsKwOthers[idx] - kwAc))
		);

		let datasetAc = {
			label: "Air Conditioner",
			backgroundColor: "#4469B8",
			borderColor: "#4469B8",
			data: lsKwAc,
		};

		let datasetOthers = {
			label: "Others",
			backgroundColor: "#B14926",
			borderColor: "#B14926",
			data: lsKwOthers,
		};

		datasets.push(datasetAc, datasetOthers);

		data.labels = labels;
		data.datasets = datasets;

		options.scales.xAxis.min = labels[0];
		options.scales.xAxis.max = labels[labels.length - 1];
		options.scales.yAxis.max = yMax;

		this.setState({
			data: data,
			options: options,
			componentShouldUpdate: true,
			lsSelectedBuildingPrev: lsSelectedBuilding,
		});

		this.buildChart();
	}

	shouldComponentUpdate() {
		return this.state.componentShouldUpdate;
	}

	componentDidUpdate() {
		this.setState({ componentShouldUpdate: false });
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
