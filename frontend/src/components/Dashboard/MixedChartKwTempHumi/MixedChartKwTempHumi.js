import React from "react";
import "./MixedChartKwTempHumi.css";

import { Chart, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-moment";

import { RiFileExcel2Fill } from "react-icons/ri";

import csv from "../../../utils/csv";
import dateFormatter from "../../../utils/dateFormatter";

import i18n from "../../../i18n";

let mixedChart;

class MixedChartKwTempHumi extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			lsBuilding: this.props.lsBuilding,
			lsSelectedBuildingPrev: [],
			lsPermission: JSON.parse(localStorage.getItem("lsPermission")),
			currentLanguage: i18n.language,

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
						type: "time",
						time: {
							displayFormats: {
								millisecond: "HH:mm:ss.SSS",
								second: "HH:mm:ss",
								minute: "HH:mm",
								hour: "HH:mm",
							},
						},
						grid: {
							display: false,
						},
					},
					yTemp: {
						display: true,
						position: "left",
						grid: { display: false },
						title: {
							display: true,
							text: "Temperature",
							font: {
								size: 16,
								weight: "600",
							},
						},
					},
					yHumi: {
						display: true,
						position: "right",
						grid: { display: false },
						title: {
							display: true,
							text: "Humidity",
							font: {
								size: 16,
								weight: "600",
							},
						},
					},
					yKw: {
						display: true,
						position: "left",
						grid: { display: false },
						title: {
							display: true,
							text: "kW",
							font: {
								weight: "600",
							},
						},
					},
				},
				plugins: {
					title: {
						display: true,
						text: "Energy (kW) Air Conditioner",
						align: "start",
						font: { weight: "bold", size: 20 },
						padding: {
							bottom: 10,
						},
					},
					legend: {
						display: true,
						position: "top",
						labels: { usePointStyle: true },
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
							x: { min: this.props.dateFrom, max: this.props.dateTo },
							y: { min: "original", max: "original" },
						},
					},
				},
			},
		};

		this.handleDoubleClick = this.handleDoubleClick.bind(this);
		this.exportData = this.exportData.bind(this);
	}

	buildChart = () => {
		let { data, options } = this.state;
		let dt = JSON.parse(JSON.stringify(data));
		let opt = JSON.parse(JSON.stringify(options));

		opt.plugins.title.text = i18n.t(opt.plugins.title.text);
		opt.scales.yTemp.title.text = i18n.t(opt.scales.yTemp.title.text);
		opt.scales.yHumi.title.text = i18n.t(opt.scales.yHumi.title.text);
		opt.plugins.tooltip.callbacks = {
			title: function (context) {
				return dateFormatter.ddmmmyyyyhhmm_noOffset(new Date(context[0].label));
			},
		};

		dt.datasets.forEach((ds) => (ds.label = i18n.t(ds.label)));

		document.getElementById("mc-kw-temp-humi").remove();
		document.getElementById(
			"wrapper-mc-kw-temp-humi"
		).innerHTML = `<canvas id="mc-kw-temp-humi" />`;

		let ctx = document.getElementById("mc-kw-temp-humi").getContext("2d");

		mixedChart = new Chart(ctx, {
			type: "bar",
			data: dt,
			options: opt,
		});
	};

	componentDidMount() {
		Chart.register(...registerables);
		Chart.register(zoomPlugin);
	}

	componentWillReceiveProps(nextProps) {
		let { data, options, lsSelectedBuildingPrev, currentLanguage } = this.state;

		if (currentLanguage !== i18n.language) {
			this.setState({ currentLanguage: i18n.language }, () =>
				this.buildChart()
			);
		}

		if (
			JSON.stringify(this.props.lsKw_system_building) ===
				JSON.stringify(nextProps.lsKw_system_building) &&
			JSON.stringify(lsSelectedBuildingPrev) ===
				JSON.stringify(nextProps.lsSelectedBuilding) &&
			JSON.stringify(this.props.lsTempHumi) ===
				JSON.stringify(nextProps.lsTempHumi) &&
			Object.values(data).length > 0
		) {
			return;
		}

		let lsKw_system_building = {};
		Object.assign(lsKw_system_building, nextProps.lsKw_system_building);

		let lsTempHumi = [];
		Object.assign(lsTempHumi, nextProps.lsTempHumi);

		let lsSelectedBuilding = nextProps.lsSelectedBuilding.slice();

		if (Object.keys(lsKw_system_building).length <= 1) return;

		let labels = [];
		let datasets = [];

		let building_lsKwMain = {};

		for (let [building, lsKw_system] of Object.entries(lsKw_system_building)) {
			if (!lsSelectedBuilding.includes(building)) continue;

			if (!building_lsKwMain[building]) building_lsKwMain[building] = [];

			let lsKwMain = building_lsKwMain[building];

			let prevDatetime;
			for (let logKwMain of lsKw_system["Main"]) {
				let datetime = new Date(logKwMain.datetime);
				let kw = logKwMain.kw;

				if (!labels.find((d) => d.getTime() === datetime.getTime())) {
					labels.push(new Date(datetime));
				}

				if (!lsSelectedBuilding.includes(building)) {
					prevDatetime = datetime;
					continue;
				}

				if (prevDatetime) {
					if (datetime.getTime() === prevDatetime.getTime()) {
						lsKwMain[lsKwMain.length - 1] += kw;
					} else lsKwMain.push(kw);
				} else lsKwMain.push(kw);

				prevDatetime = datetime;
			}
		}

		let lsKwMain = [];

		for (let lsKw of Object.values(building_lsKwMain)) {
			lsKw.forEach((kwMain, idx) => {
				if (!lsKwMain[idx]) lsKwMain[idx] = 0;
				lsKwMain[idx] += kwMain;
			});
		}

		let lsTemp = [];
		let lsHumi = [];
		for (let date of labels) {
			let log = lsTempHumi.find(
				(d) =>
					Math.abs(new Date(d.data_datetime).getTime() - date.getTime()) <= 1000
			);
			if (log === undefined) {
				lsTemp.push(0);
				lsHumi.push(0);
				continue;
			}

			let humidity = parseFloat(log.humidity).toFixed(2);
			let temperature = parseFloat(log.temperature).toFixed(2);

			lsTemp.push(temperature);
			lsHumi.push(humidity);
		}

		let datasetMain = {
			label: "kW",
			backgroundColor: "#FFB800",
			borderColor: "#FFB800",
			data: lsKwMain,
			type: "bar",
			yAxisID: "yKw",
		};

		let datasetTemp = {
			label: "Temperature",
			backgroundColor: "rgb(251, 233, 221, 0.5)",
			borderColor: "#FBE9DD",
			fill: "origin",
			borderWidth: 2,
			pointRadius: 1,
			data: lsTemp,
			type: "line",
			yAxisID: "yTemp",
		};

		let datasetHumi = {
			label: "Humidity",
			backgroundColor: "rgb(212, 222, 231, 0.5)",
			borderColor: "#D4DEE7",
			fill: "origin",
			borderWidth: 2,
			pointRadius: 1,
			data: lsHumi,
			type: "line",
			yAxisID: "yHumi",
		};

		datasets.push(datasetTemp, datasetHumi, datasetMain);

		data.labels = labels;
		data.datasets = datasets;

		options.scales.xAxis.min = labels[0];
		options.scales.xAxis.max = labels[labels.length - 1];

		options.plugins.zoom.limits.x.min = labels[0];
		options.plugins.zoom.limits.x.max = labels[labels.length - 1];

		this.setState({
			data: data,
			options: options,
			componentShouldUpdate: true,
			lsSelectedBuildingPrev: lsSelectedBuilding,
		});

		this.buildChart();
	}

	exportData() {
		let { data, compareTo } = this.state;

		let labels = data.labels;
		let dataTemp = data.datasets[0].data;
		let dataHumi = data.datasets[1].data;
		let dataKw = data.datasets[2].data;

		let rows = [[]];
		rows[0].push("Date", "kW", "Temperature", "Humidity", compareTo);

		labels.forEach((d, idx) => {
			if (!rows[idx + 1]) rows[idx + 1] = [];
			rows[idx + 1].push(
				dateFormatter.yyyymmddhhmmss_noOffset(d),
				dataKw[idx],
				dataTemp[idx],
				dataHumi[idx]
			);
		});

		csv.exportFile(`Energy (kW) Air Conditioner`, rows);
	}

	handleDoubleClick() {
		if (mixedChart) mixedChart.resetZoom();
	}

	render() {
		let { lsPermission } = this.state;
		return (
			<>
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
					id="wrapper-mc-kw-temp-humi"
					onDoubleClick={this.handleDoubleClick}
				>
					<canvas id="mc-kw-temp-humi" />
				</div>
			</>
		);
	}
}

export default MixedChartKwTempHumi;
