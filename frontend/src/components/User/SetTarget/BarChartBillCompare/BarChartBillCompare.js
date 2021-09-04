import React from "react";
import "./BarChartBillCompare.css";

import { Chart, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-moment";

import i18n from "../../../../i18n";

import { lsMonth } from "../../../../utils/months";

let barChart;

class BarChartBillCompare extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			building: {},
			compareTo: "Target",
			billData_month: {},
			compareData: [],
			lsBuilding: [],
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
						min: -100,
						max: 100,
						display: true,
						grid: {
							drawBorder: false,
							color: function (context) {
								if (context.tick.value === 0) {
									return "#000";
								}
								return "#00000000";
							},
						},
						title: {
							display: true,
							text: "%",
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
						text: "Electricity Bill Compared to Target/Average",
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
						bodySpacing: 10,
						callbacks: {
							label: function (context) {
								var label = context.dataset.label || "";

								if (label) {
									label = i18n.t(label);
									label += ": ";
								}
								if (context.parsed.y !== null) {
									if (context.parsed.y < 0) {
										label = i18n.t(label);
										label += ": ";
									}

									label += context.parsed.y + "%";
								}
								return label;
							},
						},
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
		let { data, options, billData_month, compareTo } = this.state;
		let opt = JSON.parse(JSON.stringify(options));

		if (Object.keys(billData_month).length === 0) return;

		let lsData = [];
		let lsColor = [];

		let yMax = 0;
		let month = new Date().getMonth();
		for (let i = 0; i < 12; i++) {
			if (month < 0) month += 12;

			let dataMonth = billData_month[month];
			let latest = dataMonth.latest;
			let target = dataMonth.target;
			let average = dataMonth.average;

			if (compareTo === "Target") {
				if (target === 0) lsData.unshift(0);
				else {
					lsData.unshift(
						+parseFloat(((target - latest) / target) * 100).toFixed(2)
					);
				}
			} else if (compareTo === "Average") {
				if (average === 0) lsData.unshift(0);
				else {
					lsData.unshift(
						+parseFloat(((average - latest) / average) * 100).toFixed(2)
					);
				}
			}

			month--;
		}

		lsData.forEach((data) => {
			if (Math.abs(data) > yMax) yMax = Math.abs(data);

			if (data >= 0) lsColor.push("#7DA0CF");
			else lsColor.push("#F19D9B");
		});

		let datasets = [
			{
				label: "Saved",
				backgroundColor: lsColor,
				borderColor: lsColor,
				data: lsData,
			},
		];

		let labels = [];
		for (let monthIdx = new Date().getMonth(); labels.length < 12; monthIdx--) {
			if (monthIdx < 0) monthIdx += 12;
			labels.unshift(i18n.t(lsMonth[monthIdx % 12]));
		}

		data.labels = labels;
		data.datasets = datasets;

		if (yMax === 0) yMax = 100;
		opt.scales.yAxis.max = Math.ceil(yMax);
		opt.scales.yAxis.min = Math.ceil(-yMax);

		opt.plugins.title.text = i18n.t(opt.plugins.title.text);
		opt.plugins.tooltip.callbacks = {
			label: function (context) {
				var label = context.dataset.label || "";

				if (label) {
					label = i18n.t(label);
					label += ": ";
				}
				if (context.parsed.y !== null) {
					if (context.parsed.y < 0) {
						label = i18n.t("Excess");
						label += ": ";
					}

					label += context.parsed.y + "%";
				}
				return label;
			},
		};

		document.getElementById("bc-bill-compare").remove();
		document.getElementById(
			"wrapper-bc-bill-compare"
		).innerHTML = `<canvas id="bc-bill-compare" />`;

		let ctx = document.getElementById("bc-bill-compare").getContext("2d");

		barChart = new Chart(ctx, {
			type: "bar",
			data: data,
			options: opt,
		});

		this.setState({
			data: data,
		});
	};

	componentDidMount() {
		Chart.register(...registerables);
		Chart.register(zoomPlugin);
	}

	componentWillReceiveProps(nextProps) {
		let lsBuilding = nextProps.lsBuilding;
		let compareTo = nextProps.compareTo;
		let billData_month = nextProps.billData_month;

		this.setState(
			{
				lsBuilding: lsBuilding,
				billData_month: billData_month,
				compareTo: compareTo,
			},
			() => this.buildChart()
		);
	}

	handleDoubleClick() {
		if (barChart) barChart.resetZoom();
	}

	render() {
		return (
			<div id="wrapper-bc-bill-compare" onDoubleClick={this.handleDoubleClick}>
				<canvas id="bc-bill-compare" />
			</div>
		);
	}
}

export default BarChartBillCompare;
