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
import dateFormatter from "../../../utils/dateFormatter";

let mixedChart;

class MixedChartBillCompareDate extends React.Component {
	constructor(props) {
		super(props);

		let dateFrom = this.props.dateFrom;
		let dateTo = this.props.dateTo;

		this.state = {
			lsSelectedBuilding: {},
			compareTo: "Target",
			billData_date: {},
			compareData: [],
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
		let {
			data,
			options,
			bill_building_strDate,
			compareTo,
			lsSelectedBuilding,
			lsTarget,
		} = this.state;

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

		let labels = Object.keys(bill_building_strDate).sort(
			(a, b) => new Date(a).getTime() - new Date(b).getTime()
		);

		let latest = [];
		let compareData = [];

		let yMax = 0;
		let idx = 0;
		for (let date of labels) {
			let currDate = new Date(date);
			let currYear = currDate.getFullYear();
			let currMonth = currDate.getMonth();
			let currDay = currDate.getDate();

			for (let [strDate, bill_building] of Object.entries(
				bill_building_strDate
			)) {
				let date = new Date(strDate);
				let year = date.getFullYear();
				let month = date.getMonth();
				let day = date.getDate();

				if (currMonth !== month || currDay !== day) continue;

				for (let [building, bill] of Object.entries(bill_building)) {
					if (!lsSelectedBuilding.includes(building)) continue;

					if (year === currYear) {
						if (latest[idx] === undefined) latest[idx] = 0;
						latest[idx] += Math.round(bill);

						if (latest[idx] > yMax) yMax = latest[idx];
					}

					if (compareData[idx] === undefined) compareData[idx] = 0;

					if (compareTo === "Target") {
						let target = lsTarget.find(
							(target) =>
								target.month === month + 1 &&
								target.year === year &&
								target.building === building
						);

						if (target !== undefined) {
							if (target.electricity_bill !== null) {
								compareData[idx] += Math.round(target.electricity_bill / 30);
							}
						}
					} else if (compareTo === "Average") {
						if (year < currYear) compareData[idx] += bill;
					} else if (compareTo === "Last Year") {
						if (year === currYear - 1) compareData[idx] += bill;
					}

					if (compareData[idx] > yMax) yMax = compareData[idx];
				}
			}

			idx++;
		}

		if (compareTo === "Average") {
			compareData.forEach((_, idx) => compareData[(idx /= 3)]);
		}

		datasets[0].data = latest;
		datasets[1].data = compareData;

		data.labels = labels.map((strDate) => {
			return dateFormatter.ddmmyyyy(new Date(strDate));
		});
		data.datasets = datasets;

		options.scales.yAxis.max = Math.ceil(yMax);
		options.plugins.zoom.limits.x.min = labels[0];
		options.plugins.zoom.limits.x.max = labels[labels.length - 1];

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
		let { lsSelectedBuilding, dateTo, dateFrom, compareTo } = this.state;

		if (dateTo === undefined || dateFrom === undefined) {
			this.setState(
				{
					lsSelectedBuilding: nextProps.lsSelectedBuilding,
					dateFrom: nextProps.dateFrom,
					dateTo: nextProps.dateTo,
					compareTo: nextProps.compareTo,
				},
				() => this.getBillDataDate()
			);
		} else if (
			(lsSelectedBuilding === undefined ||
				nextProps.lsSelectedBuilding.length === lsSelectedBuilding.length) &&
			nextProps.compareTo === compareTo &&
			nextProps.dateFrom.getTime() === dateFrom.getTime() &&
			nextProps.dateTo.getTime() === dateTo.getTime() &&
			nextProps.compareTo === compareTo
		) {
			return;
		} else if (
			(lsSelectedBuilding !== undefined &&
				nextProps.lsSelectedBuilding.length !==
					nextProps.lsSelectedBuilding.length) ||
			nextProps.dateFrom.getTime() !== dateFrom.getTime() ||
			nextProps.dateTo.getTime() !== dateTo.getTime()
		) {
			this.setState(
				{
					lsSelectedBuilding: nextProps.lsSelectedBuilding,
					dateFrom: nextProps.dateFrom,
					dateTo: nextProps.dateTo,
					compareTo: nextProps.compareTo,
				},
				() => this.getBillDataDate()
			);
		} else {
			this.setState(
				{
					compareTo: nextProps.compareTo,
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
					bill_building_strDate: resp.data.bill_building_date,
					lsTarget: resp.data.lsTarget,
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
		let dataLatest = data.datasets[0].data;
		let dataCompare = data.datasets[1].data;

		let rows = [[]];
		rows[0].push("Date", "Bill", compareTo);

		labels.forEach((d, idx) => {
			if (!rows[idx + 1]) rows[idx + 1] = [];
			rows[idx + 1].push(
				dateFormatter.yyyymmddhhmmss_noOffset(d),
				dataLatest[idx],
				dataCompare[idx]
			);
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
