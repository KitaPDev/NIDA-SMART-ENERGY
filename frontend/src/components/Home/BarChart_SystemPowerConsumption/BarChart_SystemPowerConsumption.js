import React from "react";
import "./BarChart_SystemPowerConsumption.css";

import { Chart } from "chart.js";
import { Bar } from "react-chartjs-2";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-moment";

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
		const bodyLines = tooltip.body.map((b) => b.lines);

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

class BarChart_SystemPowerConsumption extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			lsBuilding: this.props.lsBuilding,
			displayed_lsKw_system_building: {},

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
						display: true,
						grid: {
							display: false,
						},
					},
				},
				plugins: {
					title: {
						display: true,
						text: "Power (kW)",
						align: "start",
						font: { weight: "bold", size: 14 },
						padding: {
							bottom: 10,
						},
					},
					legend: {
						display: true,
						positoin: "top",
						labels: { usePointStyle: true },
					},
					tooltip: {
						enabled: false, // Use external instead
						external: externalTooltipHandler,
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
							x: { min: "original", max: "original" },
							y: { min: "original", max: "original" },
						},
					},
				},
			},
		};

		this.ref = { lineChart: React.createRef() };

		this.handleDoubleClick = this.handleDoubleClick.bind(this);
	}

	componentDidMount() {
		Chart.register(zoomPlugin);
	}

	componentDidUpdate(prevProps) {
		let { data, options } = this.state;

		if (
			JSON.stringify(this.props.lsKw_system_building) ===
				JSON.stringify(prevProps.lsKw_system_building) &&
			Object.values(data).length > 0
		) {
			return;
		}

		let lsKw_system_building = {};
		let lsSelectedBuilding = this.props.lsSelectedBuilding;
		let lsBuilding = this.props.lsBuilding;

		Object.assign(lsKw_system_building, this.props.lsKw_system_building);

		let labels = [];
		let datasets = [];

		if (Object.keys(lsKw_system_building).length <= 1) return;

		for (let [building, lsKw_system] of Object.entries(lsKw_system_building)) {
			if (!lsSelectedBuilding.find((b) => b === building)) continue;

			let color = lsBuilding.find((b) => b.label === building).color_code;

			let dataset = {
				label: building,
				fill: false,
				borderColor: color,
				borderWidth: 2,
				tension: 0.1,
				spanGaps: true,
				pointRadius: 2,
			};

			let data = [];
			let prevDatetime;

			for (let kwMain of lsKw_system["Main"].reverse()) {
				let datetime = new Date(kwMain.datetime);
				let kw = kwMain.kw;

				if (datasets.length === 0) {
					// let unixTimestamp = Math.floor(new Date(datetime).getTime() / 1000);
					let date = new Date(datetime);

					if (prevDatetime) {
						if (datetime.getTime() === prevDatetime.getTime()) continue;
					}

					labels.push(date);
				}

				if (prevDatetime) {
					if (datetime.getTime() === prevDatetime.getTime()) {
						data[data.length - 1] += kw;
					} else data.push(kw);
				} else data.push(kw);

				prevDatetime = datetime;
			}

			dataset.data = data;
			datasets.push(dataset);
		}

		data.labels = labels;
		data.datasets = datasets;

		options.scales.xAxis.min = labels[0];
		options.scales.xAxis.max = labels[labels.length - 1];

		this.setState({
			data: data,
			options: options,
			displayed_lsKw_system_building: lsKw_system_building,
		});
	}

	handleDoubleClick() {
		this.ref.lineChart.resetZoom();
	}

	render() {
		let { options, data } = this.state;

		return (
			<div className="wrapper" onDoubleClick={this.handleDoubleClick}>
				{Object.entries(data).length > 0 ? (
					<Bar
						id="lc-building-power"
						data={data}
						options={options}
						ref={(r) => (this.ref.lineChart = r)}
					/>
				) : (
					""
				)}
			</div>
		);
	}
}

export default BarChart_SystemPowerConsumption;
