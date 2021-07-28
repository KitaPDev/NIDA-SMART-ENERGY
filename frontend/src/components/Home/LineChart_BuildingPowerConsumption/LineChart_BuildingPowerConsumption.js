import React from "react";
import "./LineChart_BuildingPowerConsumption.css";
import { Line } from "react-chartjs-2";

class LineChart_BuildingPowerConsumption extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			options: {
				type: "line",
				plugins: {
					title: {
						display: true,
						text: "Power (kW)",
					},
					legend: false,
				},
				maintainAspectRatio: false,
			},
			lsBuilding: this.props.lsBuilding,
		};
	}

	componentWillReceiveProps(nextProps) {
		let lsKw_system_building = nextProps.lsKw_system_building;
		let lsSelectedBuilding = nextProps.lsSelectedBuilding;
		let lsBuilding = nextProps.lsBuilding;

		let { options } = this.state;

		let data = [[]];
		let series = [{ label: "time" }];

		if (Object.keys(lsKw_system_building).length <= 1) return;

		for (let [building, lsKw_system] of Object.entries(lsKw_system_building)) {
			if (!lsSelectedBuilding.find((b) => b === building)) continue;

			let color = lsBuilding.find((b) => b.label === building).color_code;

			series.push({
				label: building,
				labelSize: 0,
				points: { show: false },
				stroke: color,
				width: 1,
				fill: color,
			});

			let lsKw = [];
			let prevDatetime;

			for (let kwMain of lsKw_system["Main"]) {
				let datetime = kwMain.datetime;
				let kw = kwMain.kw;

				if (data.length === 1) {
					let unixTimestamp = Math.floor(new Date(datetime).getTime() / 1000);

					if (prevDatetime) {
						if (datetime.getTime() !== prevDatetime.getTime()) {
							data[0].push(unixTimestamp);
						}
					} else {
						data[0].push(unixTimestamp);
					}
				}

				if (prevDatetime) {
					if (datetime.getTime() === prevDatetime.getTime()) {
						lsKw[lsKw.length - 1] = lsKw[lsKw.length - 1] + kw;
						continue;
					}
				}

				lsKw.push(kw);
				prevDatetime = datetime;
			}

			data.push(lsKw);
		}

		options.series = series;

		this.setState({
			data: data,
			options: options,
		});
	}

	render() {
		let { options, data } = this.state;

		return (
			<div className="wrapper">
				{data ? <Line options={options} data={data} /> : ""}
			</div>
		);
	}
}

export default LineChart_BuildingPowerConsumption;
