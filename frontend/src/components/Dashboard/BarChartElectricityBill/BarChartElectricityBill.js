import React from "react";
import "./BarChartElectricityBill.css";

import colorConverter from "../../../utils/colorConverter";
import numberFormatter from "../../../utils/numberFormatter";

import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

import i18n from "../../../i18n";

let barChart;

class BarChartElectricityBill extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			lsBuilding: this.props.lsBuilding,
			lsSelectedBuildingPrev: [],
			currentLanguage: i18n.language,

			// Chart details
			data: {},
			options: {
				indexAxis: "y",
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
						display: false,
						grid: {
							display: true,
						},
					},
					yAxis: {
						ticks: {
							font: {
								weight: "500",
								size: 16,
							},
							autoSkip: false,
						},
						grid: {
							display: false,
						},
					},
				},
				plugins: {
					title: {
						display: true,
						text:
							i18n.language === "th"
								? "ค่าไฟฟ้า (บาท)"
								: "Electricity Bill (THB)",
						align: "start",
						font: { weight: "bold", size: 20 },
						padding: {
							bottom: 10,
						},
					},
					legend: {
						display: false,
					},
					tooltip: {
						enabled: false,
					},
					datalabels: {
						anchor: "end",
						align: "end",
						offset: 8,
						formatter: function (value) {
							return `฿ ${numberFormatter.withCommas(value)}`;
						},
						font: { weight: "500", size: 16 },
					},
				},
			},
		};

		this.handleDoubleClick = this.handleDoubleClick.bind(this);
	}

	buildChart = () => {
		let { data, options } = this.state;
		let dt = JSON.parse(JSON.stringify(data));
		let opt = JSON.parse(JSON.stringify(options));

		opt.plugins.title.text = i18n.t(opt.plugins.title.text);

		dt.labels.forEach((bld, idx) => (dt.labels[idx] = i18n.t(bld)));
		dt.datasets.forEach((ds) => (ds.label = i18n.t(ds.label)));

		let max = 1;
		dt.datasets[0].data.forEach((d) => {
			if (d > max) max = d;
		});
		max *= 1.4;

		opt.scales.xAxis.max = max;
		opt.plugins.datalabels = {
			anchor: "end",
			align: "end",
			offset: 8,
			formatter: function (value) {
				return `฿ ${numberFormatter.withCommas(value)}`;
			},
			font: { weight: "500", size: 16 },
		};

		document.getElementById("bc-electricity-bill").remove();
		document.getElementById(
			"wrapper-bc-electricity-bill"
		).innerHTML = `<canvas id="bc-electricity-bill" />`;

		let ctx = document.getElementById("bc-electricity-bill").getContext("2d");

		barChart = new Chart(ctx, {
			type: "bar",
			data: dt,
			options: opt,
			plugins: [ChartDataLabels],
		});
	};

	componentDidMount() {
		Chart.register(...registerables);
	}

	componentWillReceiveProps(nextProps) {
		let { data, options, lsSelectedBuildingPrev, currentLanguage } = this.state;

		if (currentLanguage !== i18n.language) {
			this.setState({ currentLanguage: i18n.language }, () =>
				this.buildChart()
			);
		}

		if (
			JSON.stringify(this.props.bill_building) ===
				JSON.stringify(nextProps.bill_building) &&
			JSON.stringify(lsSelectedBuildingPrev) ===
				JSON.stringify(nextProps.lsSelectedBuilding) &&
			Object.values(data).length > 0
		) {
			return;
		}

		let bill_building = {};
		Object.assign(bill_building, nextProps.bill_building);

		let lsSelectedBuilding = nextProps.lsSelectedBuilding.slice();

		let billTotal = 0;
		Object.entries(bill_building).forEach(([building, bill]) => {
			if (lsSelectedBuilding.includes(building)) billTotal += bill;
		});

		let labels = [];
		let lsData = [];
		let lsColor = [];

		let bill_building_sorted = Object.keys(bill_building)
			.sort()
			.reduce(
				(acc, key) => ({
					...acc,
					[key]: bill_building[key],
				}),
				{}
			);

		for (let [building, bill] of Object.entries(bill_building_sorted)) {
			if (!lsSelectedBuilding.includes(building)) continue;

			labels.push(building);
			lsData.push(bill);
			lsColor.push(
				"#" +
					colorConverter.pickHex(
						"d10909",
						"d1dbde",
						parseFloat(bill / billTotal).toFixed(2)
					)
			);
		}

		let datasets = [
			{
				label: "Electricity Bill",
				backgroundColor: lsColor,
				borderColor: lsColor,
				data: lsData,
			},
		];

		data.labels = labels;
		data.datasets = datasets;

		this.setState({
			data: data,
			options: options,
			lsSelectedBuildingPrev: lsSelectedBuilding,
		});

		this.buildChart();
	}

	handleDoubleClick() {
		if (barChart) barChart.resetZoom();
	}

	render() {
		return (
			<div
				id="wrapper-bc-electricity-bill"
				onDoubleClick={this.handleDoubleClick}
			>
				<canvas id="bc-electricity-bill" />
			</div>
		);
	}
}

export default BarChartElectricityBill;
