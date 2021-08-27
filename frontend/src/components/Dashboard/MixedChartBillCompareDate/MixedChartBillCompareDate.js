import React from "react";
import "./MixedChartBillCompareDate.css";

import { Chart, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-moment";

import { Col } from "reactstrap";
import { RiFileExcel2Fill } from "react-icons/ri";

import http from "../../../utils/http";
import csv from "../../../utils/csv";
import tooltipHandler from "../../../utils/tooltipHandler";

let mixedChart;

class MixedChartBillCompareDate extends React.Component {
	constructor(props) {
		super(props);

		let dateFrom = this.props.dateFrom;
		let dateTo = this.props.dateTo;

		let labels = [];
		let dateCurrent = new Date(dateFrom);
		while (dateCurrent < dateTo) {
			labels.push(new Date(dateCurrent));
			dateCurrent = new Date(dateCurrent.getTime() + 86400000);
		}

		this.state = {
			lsSelectedBuilding: {},
			compareTo: "Target",
			billData_date: {},
			compareData: [],
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
					axis: "xy",
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
							x: { min: dateFrom, max: dateTo },
							y: { min: "original", max: "original" },
						},
					},
				},
			},
		};

		this.getBillDataDate = this.getBillDataDate.bind(this);
		this.handleDoubleClick = this.handleDoubleClick.bind(this);
		this.exportData = this.exportData.bind(this);
	}

	buildChart = () => {
		// let { data, options, billData_date, compareTo } = this.state;
		// let datasets = [
		// 	{
		// 		label: "Latest",
		// 		backgroundColor: "#FFB800",
		// 		borderColor: "#FFB800",
		// 		data: [],
		// 		type: "bar",
		// 	},
		// 	{
		// 		label: compareTo,
		// 		backgroundColor: "#E2E2E2",
		// 		borderColor: "#E2E2E2",
		// 		fill: "origin",
		// 		borderWidth: 2,
		// 		pointRadius: 2,
		// 		data: [],
		// 		type: "line",
		// 	},
		// ];
		// let yMax = 0;
		// let month = new Date().getMonth() + 1;
		// for (let i = 0; i < 12; i++) {
		// 	if (month < 1) month += 12;
		// 	let dataMonth = billData_date[month];
		// 	datasets[0].data.unshift(dataMonth.latest);
		// 	let compareData = datasets[1].data;
		// 	if (compareTo === "Target") compareData.unshift(dataMonth.target);
		// 	else if (compareTo === "Average") compareData.unshift(dataMonth.average);
		// 	else if (compareTo === "Last Year")
		// 		compareData.unshift(dataMonth.lastYear);
		// 	for (let bill of Object.values(billData_date[month])) {
		// 		if (bill > yMax) yMax = bill;
		// 	}
		// 	month--;
		// }
		// data.datasets = datasets;
		// options.scales.yAxis.max = yMax;
		// document.getElementById("mc-bill-compare").remove();
		// document.getElementById(
		// 	"wrapper-mc-bill-compare"
		// ).innerHTML = `<canvas id="mc-bill-compare" />`;
		// let ctx = document.getElementById("mc-bill-compare").getContext("2d");
		// mixedChart = new Chart(ctx, {
		// 	type: "bar",
		// 	data: data,
		// 	options: options,
		// });
		// this.setState({
		// 	data: data,
		// });
	};

	componentDidMount() {
		Chart.register(...registerables);
		Chart.register(zoomPlugin);
	}

	componentWillReceiveProps(nextProps) {
		let lsSelectedBuilding = nextProps.lsSelectedBuilding;
		let dateFrom = nextProps.dateFrom;
		let dateTo = nextProps.dateTo;
		let compareTo = nextProps.compareTo;

		if (
			(lsSelectedBuilding === undefined ||
				this.props.lsSelectedBuilding.length === lsSelectedBuilding.length) &&
			this.props.compareTo === compareTo &&
			this.props.dateFrom.getTime() === dateFrom.getTime() &&
			this.props.dateTo.getTime() === dateTo.getTime()
		) {
			return;
		} else if (
			(lsSelectedBuilding !== undefined &&
				this.props.lsSelectedBuilding.length !==
					nextProps.lsSelectedBuilding.length) ||
			this.props.dateFrom.getTime() !== dateFrom.getTime() ||
			this.props.dateTo.getTime() !== dateTo.getTime()
		) {
			this.setState(
				{
					lsSelectedBuilding: lsSelectedBuilding,
					dateFrom: dateFrom,
					dateTo: dateTo,
				},
				() => this.getBillDataDate()
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

	async getBillDataDate() {
		try {
			let { dateFrom, dateTo } = this.state;

			let payload = {
				date_from: dateFrom,
				date_to: dateTo,
			};

			let resp = await http.post("/api/bill/compare", payload);

			this.setState(
				{
					billData_date: resp.data,
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
		if (mixedChart) mixedChart.resetZoom();
	}

	render() {
		return (
			<Col sm={9} id="col-graph-bill">
				<RiFileExcel2Fill
					className="icon-excel"
					size={25}
					onClick={this.exportData}
				/>
				<div
					id="wrapper-mc-bill-compare"
					onDoubleClick={this.handleDoubleClick}
				>
					<canvas id="mc-bill-compare" />
				</div>
			</Col>
		);
	}
}

export default MixedChartBillCompareDate;
