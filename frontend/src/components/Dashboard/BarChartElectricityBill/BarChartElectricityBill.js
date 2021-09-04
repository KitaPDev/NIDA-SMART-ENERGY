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

		options.plugins.title.text =
			i18n.language === "th" ? "ค่าไฟฟ้า (บาท)" : "Electricity Bill (THB)";

		if (data.labels) {
			data.labels.forEach((bld, idx) => {
				switch (bld) {
					case "Auditorium":
						if (i18n.language === "th") data.labels[idx] = "หอประชุม";
						else data.labels[idx] = "Auditorium";
						return;
					case "Bunchana":
						if (i18n.language === "th") data.labels[idx] = "บุญชนะ";
						else data.labels[idx] = "Bunchana";
						return;
					case "Choop":
						if (i18n.language === "th") data.labels[idx] = "ชุบ";
						else data.labels[idx] = "Choop";
						return;
					case "Malai":
						if (i18n.language === "th") data.labels[idx] = "มาลัย";
						else data.labels[idx] = "Malai";
						return;
					case "Naradhip":
						if (i18n.language === "th") data.labels[idx] = "นราธิป";
						else data.labels[idx] = "Naradhip";
						return;
					case "Navamin":
						if (i18n.language === "th") data.labels[idx] = "นวมินทร์";
						else data.labels[idx] = "Navamin";
						return;
					case "Nida House":
						if (i18n.language === "th") data.labels[idx] = "นิด้าเฮ้าส์";
						else data.labels[idx] = "Nida House";
						return;
					case "Nidasumpun":
						if (i18n.language === "th") data.labels[idx] = "นิด้าสัมพันธ์";
						else data.labels[idx] = "Nidasumpun";
						return;
					case "Ratchaphruek":
						if (i18n.language === "th") data.labels[idx] = "ราชพฤกษ์";
						else data.labels[idx] = "Ratchaphruek";
						return;
					case "Serithai":
						if (i18n.language === "th") data.labels[idx] = "ราชพฤกษ์";
						else data.labels[idx] = "Serithai";
						return;
					case "Siam":
						if (i18n.language === "th") data.labels[idx] = "สยาม";
						else data.labels[idx] = "Siam";
						return;
				}
			});
		}

		let max = 1;
		data.datasets[0].data.forEach((d) => {
			if (d > max) max = d;
		});
		max *= 1.4;

		options.scales.xAxis.max = max;

		document.getElementById("bc-electricity-bill").remove();
		document.getElementById(
			"wrapper-bc-electricity-bill"
		).innerHTML = `<canvas id="bc-electricity-bill" />`;

		let ctx = document.getElementById("bc-electricity-bill").getContext("2d");

		barChart = new Chart(ctx, {
			type: "bar",
			data: data,
			options: options,
			plugins: [ChartDataLabels],
		});
	};

	componentDidMount() {
		Chart.register(...registerables);
	}

	componentWillReceiveProps(nextProps) {
		let { data, options, lsSelectedBuildingPrev, currentLanguage } = this.state;

		if (currentLanguage !== i18n.language) {
			options.plugins.title.text =
				i18n.language === "th" ? "ค่าไฟฟ้า (บาท)" : "Electricity Bill (THB)";

			if (data.labels) {
				data.labels.forEach((bld, idx) => {
					if (bld === "Auditorium" || bld === "หอประชุม") {
						i18n.language === "th"
							? (data.labels[idx] = "หอประชุม")
							: (data.labels[idx] = "Auditorium");
					} else if (bld === "Bunchana" || bld === "บุญชนะ") {
						i18n.language === "th"
							? (data.labels[idx] = "บุญชนะ")
							: (data.labels[idx] = "Bunchana");
					} else if (bld === "Choop" || bld === "ชุบ") {
						i18n.language === "th"
							? (data.labels[idx] = "ชุบ")
							: (data.labels[idx] = "Choop");
					} else if (bld === "Malai" || bld === "มาลัย") {
						i18n.language === "th"
							? (data.labels[idx] = "มาลัย")
							: (data.labels[idx] = "Malai");
					} else if (bld === "Naradhip" || bld === "นราธิป") {
						i18n.language === "th"
							? (data.labels[idx] = "นราธิป")
							: (data.labels[idx] = "Naradhip");
					} else if (bld === "Navamin" || bld === "นวมินทร์") {
						i18n.language === "th"
							? (data.labels[idx] = "นวมินทร์")
							: (data.labels[idx] = "Navamin");
					} else if (bld === "Nida House" || bld === "นิด้าเฮ้าส์") {
						i18n.language === "th"
							? (data.labels[idx] = "นิด้าเฮ้าส์")
							: (data.labels[idx] = "Nida House");
					} else if (bld === "Nidasumpun" || bld === "นิด้าสัมพันธ์") {
						i18n.language === "th"
							? (data.labels[idx] = "นิด้าสัมพันธ์")
							: (data.labels[idx] = "Nidasumpun");
					} else if (bld === "Ratchaphruek" || bld === "ราชพฤกษ์") {
						i18n.language === "th"
							? (data.labels[idx] = "ราชพฤกษ์")
							: (data.labels[idx] = "Ratchaphruek");
					} else if (bld === "Serithai" || bld === "เสรีไทย") {
						i18n.language === "th"
							? (data.labels[idx] = "เสรีไทย")
							: (data.labels[idx] = "Serithai");
					} else if (bld === "Siam" || bld === "สยาม") {
						i18n.language === "th"
							? (data.labels[idx] = "สยาม")
							: (data.labels[idx] = "Siam");
					}
				});
			}

			this.setState(
				{
					data: data,
					options: options,
					currentLanguage: i18n.language,
				},
				() => this.buildChart()
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
