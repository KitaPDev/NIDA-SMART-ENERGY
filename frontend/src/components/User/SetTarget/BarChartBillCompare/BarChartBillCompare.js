import React from "react";
import "./BarChartBillCompare.css";

import { Chart, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-moment";

import http from "../../../../utils/http";
import csv from "../../../../utils/csv";
import tooltipHandler from "../../../../utils/tooltipHandler";

const lsMonth = [
	"JAN",
	"FEB",
	"MAR",
	"APR",
	"MAY",
	"JUN",
	"JUL",
	"AUG",
	"SEP",
	"OCT",
	"NOV",
	"DEC",
];

let barChart;

class BarChartBillCompare extends React.Component {
	constructor(props) {
		super(props);

		let labels = [];
		for (let monthIdx = new Date().getMonth(); labels.length < 12; monthIdx--) {
			if (monthIdx < 0) monthIdx += 12;
			labels.unshift(lsMonth[monthIdx % 12]);
		}

		this.state = {
			building: {},
			compareTo: "Target",
			billData_month: {},
			compareData: [],
			lsBuilding: [],
			// Chart details
			data: {
				labels: labels,
			},
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
					},
				},
				plugins: {
					title: {
						display: true,
						text: "Electricity Bill Compare to Target/Average",
						align: "start",
						font: { weight: "bold", size: 20 },
					},
					legend: {
						display: false,
					},
					tooltip: {
						enabled: false,
						external: tooltipHandler.tooltipHandlerLeft_200_top_100,
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
							x: { min: labels[0], max: labels[labels.length - 1] },
							y: { min: "original", max: "original" },
						},
					},
				},
			},
		};

		this.getBillDataMonth = this.getBillDataMonth.bind(this);
		this.handleDoubleClick = this.handleDoubleClick.bind(this);
		this.exportData = this.exportData.bind(this);
	}

	buildChart = () => {
		let { data, options, billData_month, compareTo } = this.state;

		if (Object.keys(billData_month).length === 0) return;

		let datasets = [
			{
				label: "Latest",
				backgroundColor: "#FFB800",
				borderColor: "#FFB800",
				data: [],
				type: "bar",
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

		data.datasets = datasets;
		options.scales.yAxis.max = Math.ceil(yMax);

		document.getElementById("bc-bill-compare").remove();
		document.getElementById(
			"wrapper-bc-bill-compare"
		).innerHTML = `<canvas id="bc-bill-compare" />`;

		let ctx = document.getElementById("bc-bill-compare").getContext("2d");

		barChart = new Chart(ctx, {
			type: "bar",
			data: data,
			options: options,
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

		if (
			(lsBuilding === undefined ||
				this.props.lsBuilding.length === lsBuilding.length) &&
			this.props.compareTo === compareTo
		) {
			this.setState(
				{
					lsBuilding: lsBuilding,
				},
				() => this.getBillDataMonth()
			);
		} else if (
			lsBuilding !== undefined &&
			this.props.lsBuilding.length !== nextProps.lsBuilding.length
		) {
			this.setState(
				{
					lsBuilding: lsBuilding,
				},
				() => this.getBillDataMonth()
			);
		} else {
			this.setState(
				{
					compareTo: compareTo,
				},
				() => this.buildChart()
			);
		}
	}

	async getBillDataMonth() {
		try {
			let { lsBuilding } = this.state;

			let payload = {
				building_id: lsBuilding.map(function (building) {
					return building.id;
				}),
			};

			let resp = await http.post("/building/bill/compare", payload);

			this.setState(
				{
					billData_month: resp.data,
				},
				() => this.buildChart()
			);
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	exportData() {
		let { data, compareTo } = this.state;

		let labels = data.labels;
		let dataMonth = data.datasets[0].data;
		let dataMonthCompare = data.datasets[1].data;

		let rows = [[]];
		rows[0].push("Month", "Bill", compareTo);

		dataMonth.forEach((d, idx) => {
			if (!rows[idx + 1]) rows[idx + 1] = [];
			rows[idx + 1].push(labels[idx], d, dataMonthCompare[idx]);
		});

		csv.exportFile(`Bill Compare to ${compareTo}`, rows);
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
