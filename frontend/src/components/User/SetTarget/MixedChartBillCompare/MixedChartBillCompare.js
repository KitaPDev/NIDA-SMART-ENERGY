import React from "react";
import "./MixedChartBillCompare.css";

import { Chart, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-moment";

import i18n from "../../../../i18n";

import { lsMonth } from "../../../../utils/months";

let mixedChart;

class MixedChartBillCompare extends React.Component {
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
						min: 0,
						max: 100,
						display: true,
						grid: {
							display: false,
						},
						title: {
							display: true,
							text: "THB",
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
						text: "Electricity Bill (THB)",
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

		let datasets = [
			{
				label: "Latest",
				backgroundColor: "#FFB800",
				borderColor: "#FFB800",
				data: [],
				type: "bar",
			},
			{
				label: compareTo,
				backgroundColor: "#E2E2E2",
				borderColor: "#E2E2E2",
				fill: "origin",
				borderWidth: 2,
				pointRadius: 2,
				data: [],
				type: "line",
			},
		];

		let yMax = 0;
		let month = new Date().getMonth();
		for (let i = 0; i < 12; i++) {
			if (month < 0) month += 12;

			let dataMonth = billData_month[month];

			datasets[0].data.unshift(dataMonth.latest);

			let compareData = datasets[1].data;
			if (compareTo === "Target") compareData.unshift(dataMonth.target);
			else if (compareTo === "Average") compareData.unshift(dataMonth.average);

			for (let bill of Object.values(billData_month[month])) {
				if (bill > yMax) yMax = bill;
			}

			month--;
		}

		let labels = [];
		for (let monthIdx = new Date().getMonth(); labels.length < 12; monthIdx--) {
			if (monthIdx < 0) monthIdx += 12;
			labels.unshift(i18n.t(lsMonth[monthIdx % 12]));
		}

		data.labels = labels;
		data.datasets = datasets;
		opt.scales.yAxis.max = Math.ceil(yMax);

		opt.plugins.title.text = i18n.t(opt.plugins.title.text);
		opt.scales.yAxis.title.text = i18n.t(opt.scales.yAxis.title.text);

		data.datasets.forEach((ds) => {
			ds.label = i18n.t(ds.label);
		});

		document.getElementById("mc-bill-compare").remove();
		document.getElementById(
			"wrapper-mc-bill-compare"
		).innerHTML = `<canvas id="mc-bill-compare" />`;

		let ctx = document.getElementById("mc-bill-compare").getContext("2d");

		mixedChart = new Chart(ctx, {
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
		if (mixedChart) mixedChart.resetZoom();
	}

	render() {
		return (
			<div id="wrapper-mc-bill-compare" onDoubleClick={this.handleDoubleClick}>
				<canvas id="mc-bill-compare" />
			</div>
		);
	}
}

export default MixedChartBillCompare;
