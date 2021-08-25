import React from "react";
import "./MixedChartBillCompare.css";

import { Chart, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-moment";

import { Col } from "reactstrap";
import { RiFileExcel2Fill } from "react-icons/ri";

import http from "../../../utils/http";
import csv from "../../../utils/csv";
import tooltipHandler from "../../../utils/tooltipHandler";

let mixedChart;

class MixedChartBillCompare extends React.Component {
	constructor(props) {
		super(props);

		let dateFrom = this.props.dateFrom;
		let dateTo = this.props.dateTo;

		let labels = [];
		let dateCurrent = new Date(dateFrom);
		while (dateCurrent < dateTo) {
			labels.push(new Date(dateCurrent));
			dateCurrent = dateCurrent.addDays(1);
		}

		this.state = {
			building: {},
			compareTo: "Target",
			billData_month: {},
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

		this.getBillDataMonth = this.getBillDataMonth.bind(this);
		this.handleDoubleClick = this.handleDoubleClick.bind(this);
		this.exportData = this.exportData.bind(this);
	}

	buildChart = () => {
		let { data, options, billData_month, compareTo } = this.state;

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
		let month = new Date().getMonth() + 1;
		for (let i = 0; i < 12; i++) {
			if (month < 1) month += 12;

			let dataMonth = billData_month[month];

			datasets[0].data.unshift(dataMonth.latest);

			let compareData = datasets[1].data;
			if (compareTo === "Target") compareData.unshift(dataMonth.target);
			else if (compareTo === "Average") compareData.unshift(dataMonth.average);
			else if (compareTo === "Last Year")
				compareData.unshift(dataMonth.lastYear);

			for (let bill of Object.values(billData_month[month])) {
				if (bill > yMax) yMax = bill;
			}

			month--;
		}

		data.datasets = datasets;
		options.scales.yAxis.max = yMax;

		document.getElementById("mc-bill-compare").remove();
		document.getElementById(
			"wrapper-mc-bill-compare"
		).innerHTML = `<canvas id="mc-bill-compare" />`;

		let ctx = document.getElementById("mc-bill-compare").getContext("2d");

		mixedChart = new Chart(ctx, {
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
		let building = nextProps.building;
		let compareTo = nextProps.compareTo;

		if (
			(building === undefined || this.props.building === nextProps.building) &&
			this.props.compareTo === nextProps.compareTo
		) {
			return;
		} else if (
			building !== undefined &&
			this.props.building !== nextProps.building
		) {
			this.setState(
				{
					building: building,
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
			let { building } = this.state;

			let payload = {
				building_id: building.id,
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

export default MixedChartBillCompare;
