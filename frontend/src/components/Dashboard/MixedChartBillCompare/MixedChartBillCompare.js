import React from "react";
import "./MixedChartBillCompare.css";

import { Chart, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-moment";

import { Col } from "reactstrap";
import { RiFileExcel2Fill } from "react-icons/ri";

import http from "../../../utils/http";
import csv from "../../../utils/csv";

import i18n from "../../../i18n";

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

let mixedChart;

class MixedChartBillCompare extends React.Component {
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
			lsPermission: JSON.parse(localStorage.getItem("lsPermission")),
			currentLanguage: i18n.language,

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
						display: false,
					},
					legend: {
						display: false,
					},
					tooltip: {
						enabled: true,
						padding: 8,
						backgroundColor: "#F2F2F2",
						titleColor: "#000",
						bodyColor: "#000",
						titleFont: { size: 16 },
						bodyFont: { size: 14 },
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
			else if (compareTo === "Last Year")
				compareData.unshift(dataMonth.lastYear);

			for (let bill of Object.values(billData_month[month])) {
				if (bill > yMax) yMax = bill;
			}

			month--;
		}

		data.datasets = datasets;
		options.scales.yAxis.max = Math.ceil(yMax);

		if (data.datasets) {
			if (data.datasets.length > 0) {
				let ds = data.datasets[0];
				ds.label = i18n.language === "th" ? "ค่าล่าสุด" : "Latest";

				ds = data.datasets[1];
				if (ds.label === "Target" || ds.label === "ค่าเป้าหมาย") {
					ds.label = i18n.language === "th" ? "ค่าเป้าหมาย" : "Target";
				} else if (ds.label === "Average" || ds.label === "ค่าเฉลี่ย") {
					ds.label = i18n.language === "th" ? "ค่าเฉลี่ย" : "Average";
				} else if (ds.label === "Last Year" || ds.label === "ค่าปีที่แล้ว") {
					ds.label = i18n.language === "th" ? "ค่าปีที่แล้ว" : "Last Year";
				}
			}
		}

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
		let { data, currentLanguage } = this.state;

		if (currentLanguage !== i18n.language) {
			if (data.datasets) {
				if (data.datasets.length > 0) {
					data.datasets[0].label =
						i18n.language === "th" ? "ค่าล่าสุด" : "Latest";
					data.datasets[1].label = i18n.language === "th" ? "อื่นๆ" : "Others";
				}
			}

			this.setState({ currentLanguage: i18n.language, data: data });
		}

		let lsBuilding = nextProps.lsBuilding;
		let compareTo = nextProps.compareTo;
		let billData_month = nextProps.billData_month;

		if (
			(lsBuilding === undefined ||
				this.props.lsBuilding.length === lsBuilding.length) &&
			this.props.compareTo === compareTo &&
			Object.keys(billData_month).length > 0
		) {
			this.setState(
				{
					lsBuilding: lsBuilding,
					billData_month: billData_month,
				},
				() => this.buildChart()
			);
		} else if (
			lsBuilding !== undefined &&
			this.props.lsBuilding.length !== nextProps.lsBuilding.length &&
			Object.keys(billData_month).length > 0
		) {
			this.setState(
				{
					lsBuilding: lsBuilding,
					billData_month: billData_month,
				},
				() => this.buildChart()
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
		if (mixedChart) mixedChart.resetZoom();
	}

	render() {
		let { lsPermission } = this.state;
		return (
			<Col sm={9} id="col-graph-bill">
				{lsPermission.find((p) => p.label === "Export Information") ? (
					<RiFileExcel2Fill
						className="icon-excel"
						size={25}
						onClick={this.exportData}
					/>
				) : (
					<></>
				)}
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
