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

import { lsMonth } from "../../../utils/months";

let mixedChart;

class MixedChartBillCompare extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      building: {},
      compareTo: "Target",
      billData_month: {},
      compareData: [],
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
            title: {
              display: true,
              text: "Baht",
              font: {
                size: 10,
                weight: "600",
              },
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
              speed: 100,
            },
            limits: {
              x: { min: "original", max: "original" },
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

    let labels = [];
    for (let monthIdx = new Date().getMonth(); labels.length < 12; monthIdx--) {
      if (monthIdx < 0) monthIdx += 12;
      labels.unshift(i18n.t(lsMonth[monthIdx % 12]));
    }

    data.labels = labels;

    datasets.forEach((ds) => (ds.label = i18n.t(ds.label)));
    data.datasets = datasets;

    options.scales.yAxis.max = Math.ceil(yMax);
    options.scales.yAxis.title.text = i18n.t(options.scales.yAxis.title.text);

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

    let building = nextProps.building;
    let compareTo = nextProps.compareTo;

    if (currentLanguage !== i18n.language) {
      if (data.datasets) {
        data.datasets.forEach((ds) => (ds.label = i18n.t(ds.label)));
      }

      if (data.labels) {
        data.labels.forEach((month, idx) => (data.labels[idx] = i18n.t(month)));
      }

      this.setState({ currentLanguage: i18n.language, data: data }, () =>
        this.buildChart()
      );
    }

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
