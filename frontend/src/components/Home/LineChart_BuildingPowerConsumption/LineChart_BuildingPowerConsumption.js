import React from "react";
import "./LineChart_BuildingPowerConsumption.css";

import { Line } from "react-chartjs-2";
import * as zoom from "chartjs-plugin-zoom";
import "chartjs-adapter-moment";

class LineChart_BuildingPowerConsumption extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: {},
			options: {
				type: "line",
				// Turn off animations and data parsing for performance
				animation: false,
				parsing: false,
				responsive: true,
				maintainAspectRatio: false,
				title: {
					display: true,
					text: "Power (kW)",
				},
				legend: {
					display: false,
				},
				tooltips: {
					enabled: true,
				},
				scales: {
					x: {
						type: "time",
						time: {
							unit: "minute",
							displayFormats: { minute: "hh:mm" },
						},
						ticks: {
							source: "labels",
							// Disabled rotation for performance
							maxRotation: 0,
							autoSkip: true,
						},
						gridLines: {
							display: false,
						},
					},

					y: {
						position: "left",
					},
				},

				plugins: {
					decimation: { algorithm: "lttb", enabled: true, samples: 500 },
					zoom: {
						zoom: {
							drag: {
								enabled: true,
							},
						},
					},
				},
				normalized: true, // Performance optimization
				maintainAspectRatio: false,
			},
			// zoom and pan
			pan: {
				enabled: true,
				mode: "x",
				speed: 10,
				threshold: 10,
				rangeMin: {
					x: null,
					y: null,
				},
				rangeMax: {
					x: null,
					y: null,
				},
			},
			zoom: {
				enabled: true,
				mode: "x",
			},
			lsBuilding: this.props.lsBuilding,
		};
	}

	componentDidUpdate(prevProps) {
		let { data, options } = this.state;

		if (
			this.props.lsKw_system_building === prevProps.lsKw_system_building &&
			Object.values(data).length > 0
		) {
			return;
		}

		let lsKw_system_building = this.props.lsKw_system_building;
		let lsSelectedBuilding = this.props.lsSelectedBuilding;
		let lsBuilding = this.props.lsBuilding;

		let labels = [];
		let datasets = [];

		if (Object.keys(lsKw_system_building).length <= 1) return;

		for (let [building, lsKw_system] of Object.entries(lsKw_system_building)) {
			if (!lsSelectedBuilding.find((b) => b === building)) continue;

			let color = lsBuilding.find((b) => b.label === building).color_code;

			let dataset = {
				label: building,
				fill: false,
				borderColor: color,
				tension: 0.1,
			};

			let data = [];
			let prevDatetime;

			for (let kwMain of lsKw_system["Main"].reverse()) {
				let datetime = kwMain.datetime;
				let kw = kwMain.kw;

				if (datasets.length === 0) {
					let unixTimestamp = Math.floor(new Date(datetime).getTime() / 1000);

					if (prevDatetime) {
						if (datetime.getTime() !== prevDatetime.getTime()) {
							labels.push(unixTimestamp);
						} else {
							data[data.length - 1] = data[data.length - 1] + kw;
							continue;
						}
					} else {
						labels.push(unixTimestamp);
					}
				}

				data.push(kw);
				prevDatetime = datetime;
			}

			dataset.data = data;
			datasets.push(dataset);
		}

		data.labels = labels;
		data.datasets = datasets;

		options.scales.x.min = labels[0];
		options.scales.x.max = labels[labels.length - 1];

		this.setState({
			data: data,
			options: options,
		});
	}

	render() {
		let { options, data } = this.state;

		return (
			<div className="wrapper">
				{data ? <Line options={{ options }} data={{ data }} /> : ""}
			</div>
		);
	}
}

export default LineChart_BuildingPowerConsumption;
