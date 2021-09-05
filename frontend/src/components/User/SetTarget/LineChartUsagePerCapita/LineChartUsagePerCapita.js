import React from "react";
import "./LineChartUsagePerCapita.css";

import { Chart, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-moment";

import i18n from "../../../../i18n";

import { lsMonth } from "../../../../utils/months";

let lineChart;

class LineChartUsagePerCapita extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			lsBuilding: [],
			lsTarget: [],
			kwh_building_month: {},

			// Chart details
			data: {},
			options: {
				responsive: true,
				animation: false,
				maintainAspectRatio: false,
				interaction: {
					intersect: false,
					axis: "x",
					mode: "index",
				},
				scales: {
					xAxis: {
						grid: {
							display: false,
						},
					},
					yAxis: {
						min: 0,
						max: 100,
						display: true,
						grid: {
							display: false,
						},
						title: {
							display: true,
							text: "kWh",
							font: {
								size: 16,
								weight: "600",
							},
						},
					},
				},
				plugins: {
					title: {
						display: true,
						text: "Energy Use per Capita",
						align: "start",
						font: { weight: "bold", size: 20 },
					},
					legend: {
						display: false,
					},
					tooltip: {
						enabled: true,
						padding: 14,
						backgroundColor: "#F2F2F2",
						titleColor: "#000",
						bodyColor: "#000",
						titleFont: { size: 20 },
						bodyFont: { size: 18 },
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

		this.handleDoubleClick = this.handleDoubleClick.bind(this);
	}

	buildChart = () => {
		let { data, options, lsBuilding, lsTarget, kwh_building_month } =
			this.state;
		let opt = JSON.parse(JSON.stringify(options));

		if (Object.keys(kwh_building_month).length === 0) return;

		let datasets = [];
		lsBuilding.forEach((building) => {
			datasets.push({
				label: building.label,
				fill: false,
				borderColor: building.color_code,
				backgroundColor: building.color_code,
				borderWidth: 2,
				spanGaps: true,
				pointRadius: 2,
				data: [],
			});
		});

		let yMax = 0;

		let year = new Date().getFullYear();
		let month = new Date().getMonth();
		for (let i = 0; i < 12; i++) {
			if (month < 0) {
				month += 12;
				year--;
			}

			let kwh_building = kwh_building_month[month];
			if (kwh_building === undefined) {
				datasets.forEach((ds) => {
					ds.data.unshift(0);
				});
				continue;
			} else if (Object.keys(kwh_building).length === 0) {
				datasets.forEach((ds) => {
					ds.data.unshift(0);
				});
				continue;
			}

			datasets.forEach((ds) => {
				if (!Object.keys(kwh_building).includes(ds.label)) ds.data.unshift(0);
			});

			for (let [building, kwh] of Object.entries(kwh_building)) {
				let ds = datasets.find((ds) => ds.label === building);

				let target = lsTarget.find(
					(t) => t.building === building && t.month === month && t.year === year
				);
				if (target === undefined) ds.data.unshift(0);
				else if (target.amount_people === null) ds.data.unshift(0);
				else {
					ds.data.unshift(parseFloat(kwh / target.amount_people).toFixed(2));

					if (kwh / target.amount_people > yMax) {
						yMax = kwh / target.amount_people;
					}
				}
			}

			month--;
		}

		let labels = [];
		for (let monthIdx = new Date().getMonth(); labels.length < 12; monthIdx--) {
			if (monthIdx < 0) monthIdx += 12;
			labels.unshift(i18n.t(lsMonth[monthIdx % 12]));
		}
		data.labels = labels;

		datasets.forEach((ds) => {
			ds.label = i18n.t(ds.label);
		});

		data.datasets = datasets;

		opt.scales.yAxis.max = Math.ceil(yMax);
		opt.plugins.title.text = i18n.t(opt.plugins.title.text);
		opt.scales.yAxis.title.text = i18n.t(opt.scales.yAxis.title.text);
		opt.plugins.tooltip.callbacks = {
			title: function (context) {
				let month = context[0].label;
				Object.entries(i18n.getDataByLanguage("th").translation).forEach(
					([en, th]) => {
						if (th === context[0].label) {
							month = en;
							return;
						}
					}
				);

				let displayYear = new Date().getFullYear();
				lsMonth.forEach((mth, idx) => {
					if (mth === month) {
						if (new Date().getMonth() - idx < 0) {
							displayYear = new Date().getFullYear() - 1;
						}
					}
				});

				return context[0].label + " " + displayYear;
			},
		};

		document.getElementById("lc-energy-capita").remove();
		document.getElementById(
			"wrapper-lc-energy-capita"
		).innerHTML = `<canvas id="lc-energy-capita" />`;

		let ctx = document.getElementById("lc-energy-capita").getContext("2d");

		lineChart = new Chart(ctx, {
			type: "line",
			data: data,
			options: opt,
		});
	};

	componentDidMount() {
		Chart.register(...registerables);
		Chart.register(zoomPlugin);
	}

	componentWillReceiveProps(nextProps) {
		let lsBuilding = nextProps.lsBuilding;
		let lsTarget = nextProps.lsTarget;
		let kwh_building_month = nextProps.kwh_building_month;

		this.setState(
			{
				lsBuilding: lsBuilding,
				lsTarget: lsTarget,
				kwh_building_month: kwh_building_month,
			},
			() => this.buildChart()
		);
	}

	handleDoubleClick() {
		if (lineChart) lineChart.resetZoom();
	}

	render() {
		return (
			<div id="wrapper-lc-energy-capita" onDoubleClick={this.handleDoubleClick}>
				<canvas id="lc-energy-capita" />
			</div>
		);
	}
}

export default LineChartUsagePerCapita;
