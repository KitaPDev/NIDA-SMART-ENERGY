import React from "react";
import "./BarChartSystemPowerConsumption.css";

import { Chart, registerables } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import "chartjs-adapter-moment";

import dateFormatter from "../../../utils/dateFormatter";
import i18n from "../../../i18n";

let barChart;

class BarChartSystemPowerConsumption extends React.Component {
	constructor(props) {
		super(props);

		let today = new Date();
		let xMin = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate(),
			0,
			0,
			0,
			0
		);

		this.state = {
			lsBuilding: this.props.lsBuilding,
			lsSelectedBuildingPrev: [],
			componentShouldUpdate: true,
			currentLanguage: i18n.language,

			// Chart details
			data: {},
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
						stacked: true,
					},
					yAxis: {
						min: 0,
						max: 100,
						display: true,
						grid: {
							display: false,
						},
						stacked: true,
					},
				},
				plugins: {
					title: {
						display: true,
						text: "Power (kW)",
						align: "start",
						font: { weight: "bold", size: 14 },
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
						padding: 14,
						backgroundColor: "#F2F2F2",
						titleColor: "#000",
						bodyColor: "#000",
						titleFont: { size: 18 },
						bodyFont: { size: 16 },
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
							speed: 2,
						},
						limits: {
							x: { min: xMin, max: today },
							y: { min: "original", max: "original" },
						},
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

		opt.plugins.zoom.limits.x.min = new Date(opt.plugins.zoom.limits.x.min);
		opt.plugins.zoom.limits.x.max = new Date(opt.plugins.zoom.limits.x.max);

		opt.plugins.title.text = i18n.t(opt.plugins.title.text);
		opt.plugins.tooltip.callbacks = {
			title: function (context) {
				return dateFormatter.ddmmmyyyyhhmm_noOffset(new Date(context[0].label));
			},
		};

		dt.datasets.forEach((ds) => (ds.label = i18n.t(ds.label)));

		document.getElementById("bc-system-power").remove();
		document.getElementById(
			"wrapper-bc-system-power"
		).innerHTML = `<canvas id="bc-system-power" />`;

		let ctx = document.getElementById("bc-system-power").getContext("2d");

		barChart = new Chart(ctx, {
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
			Object.values(data).length > 0
		) {
			return;
		}

		let lsKw_system_building = {};
		Object.assign(lsKw_system_building, nextProps.lsKw_system_building);

		let lsSelectedBuilding = nextProps.lsSelectedBuilding.slice();

		if (Object.keys(lsKw_system_building).length <= 1) return;

		let labels = [];
		let datasets = [];

		let building_lsKwMain = {};
		let building_lsKwAc = {};

		for (let [building, lsKw_system] of Object.entries(lsKw_system_building)) {
			if (!lsSelectedBuilding.includes(building)) continue;

			if (!building_lsKwMain[building]) building_lsKwMain[building] = [];
			if (!building_lsKwAc[building]) building_lsKwAc[building] = [];

			let lsKwMain = building_lsKwMain[building];
			let lsKwAc = building_lsKwAc[building];

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

			// Fill AC array with zeroes if no AC kw readings
			if (!lsKw_system["Air Conditioner"]) {
				let lengthDiff = lsKwMain.length - lsKwAc.length;
				building_lsKwAc[building] = lsKwAc.concat(Array(lengthDiff).fill(0));
				continue;
			}

			for (let logKwAc of lsKw_system["Air Conditioner"]) {
				let datetime = new Date(logKwAc.datetime);
				let kw = logKwAc.kw;

				if (prevDatetime) {
					if (datetime.getTime() === prevDatetime.getTime()) {
						lsKwAc[lsKwAc.length - 1] += kw;
					} else lsKwAc.push(kw);
				} else lsKwAc.push(kw);

				prevDatetime = datetime;
			}
		}

		let lsKwOthers = [];
		let lsKwAc = [];

		let yMax = 0;
		for (let [building, lsKwMain] of Object.entries(building_lsKwMain)) {
			lsKwMain.forEach((kwMain, idx) => {
				if (!lsKwOthers[idx]) lsKwOthers[idx] = 0;
				lsKwOthers[idx] += kwMain;

				if (lsKwOthers[idx] > yMax) yMax = lsKwOthers[idx];
			});

			building_lsKwAc[building].forEach((kwAc, idx) => {
				if (!lsKwAc[idx]) lsKwAc[idx] = 0;
				lsKwAc[idx] += kwAc;
			});
		}

		lsKwAc.forEach(
			(kwAc, idx) => (lsKwOthers[idx] = Math.abs(lsKwOthers[idx] - kwAc))
		);

		let datasetAc = {
			label: "Air Conditioner",
			backgroundColor: "#4469B8",
			borderColor: "#4469B8",
			data: lsKwAc,
		};

		let datasetOthers = {
			label: "Others",
			backgroundColor: "#B14926",
			borderColor: "#B14926",
			data: lsKwOthers,
		};

		datasets.push(datasetAc, datasetOthers);

		data.labels = labels;
		data.datasets = datasets;

		options.scales.xAxis.min = labels[0];
		options.scales.xAxis.max = labels[labels.length - 1];
		options.scales.yAxis.max = yMax;

		this.setState({
			data: data,
			options: options,
			componentShouldUpdate: true,
			lsSelectedBuildingPrev: lsSelectedBuilding,
		});

		this.buildChart();
	}

	shouldComponentUpdate() {
		return this.state.componentShouldUpdate;
	}

	componentDidUpdate() {
		this.setState({ componentShouldUpdate: false });
	}

	handleDoubleClick() {
		if (barChart) barChart.resetZoom();
	}

	render() {
		return (
			<div id="wrapper-bc-system-power" onDoubleClick={this.handleDoubleClick}>
				<canvas id="bc-system-power" />
			</div>
		);
	}
}

export default BarChartSystemPowerConsumption;
