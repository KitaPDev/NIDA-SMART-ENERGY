import React from "react";

// API Service
import {
  subjectPowerMeterData,
  subjectSolarData,
  apiService,
} from "../../apiService";

// Charts and Diagrams
import PieChartEnergySource from "./PieChartEnergySource/PieChartEnergySource";
import PieChartSystem from "./PieChartSystem/PieChartSystem";
import LineChartBuildingPowerConsumption from "./LineChartBuildingPowerConsumption/LineChartBuildingPowerConsumption";
import BarChartSystemPowerConsumption from "./BarChartSystemPowerConsumption/BarChartSystemPowerConsumption";

// Styling and Media
import "./Home.css";
import { Container, Row, Col, Progress } from "reactstrap";
import { IoMdPeople } from "react-icons/io";
import { ReactSVG } from "react-svg";

// Utils
import http from "../../utils/http";
import colorConverter from "../../utils/colorConverter";
import numberFormatter from "../../utils/numberFormatter";

import { withTranslation } from "react-i18next";

let subscriberPowerMeterData;
let subscriberSolarData;

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lsSelectedBuilding: [],
      lsSystem: [],
      tariff_building: {},
      kwh_system_building: {},
      lsKw_system_building: {},
      bill_building: {},
      targetBill_building: {},
      kwhMonth_building: {},
      kwhSolar: 0,
      kwhSolarMonth: 0,
      lsBuilding: [],
      currentTime: new Date()
        .toLocaleString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace("24:", "00:"),
      buildingPath: window.location.origin + "/building/", // For Building Images
      propsPath: window.location.origin + "/props/", // For Props Images
      isDisplayBill: false,
      visitors: 0,
    };

    this.getAllSystem = this.getAllSystem.bind(this);
    this.getAllTargetByMonthYear = this.getAllTargetByMonthYear.bind(this);
    this.getAllBuilding = this.getAllBuilding.bind(this);
    this.onClickBuilding = this.onClickBuilding.bind(this);
    this.getPowerUsedCurrentMonthBuilding =
      this.getPowerUsedCurrentMonthBuilding.bind(this);
    this.getSolarCurrentMonth = this.getSolarCurrentMonth.bind(this);
    this.toggleDisplayBill = this.toggleDisplayBill.bind(this);
    this.onDoubleClickBuilding = this.onDoubleClickBuilding.bind(this);
    this.getVisitors = this.getVisitors.bind(this);
  }

  async componentDidMount() {
    await this.getAllSystem();
    await this.getAllTargetByMonthYear();
    await this.getPowerUsedCurrentMonthBuilding();
    await this.getAllBuilding();
    await this.getSolarCurrentMonth();
    await this.getVisitors();

    let today = new Date();
    let dateStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0
    );
    let dateEnd = new Date();

    apiService.updatePowerMeterData(dateStart, dateEnd);
    apiService.updateSolarData(dateStart, dateEnd);

    subscriberPowerMeterData = subjectPowerMeterData.subscribe((dataPower) => {
      let { tariff_building } = this.state;
      let kwh_system_building = {};
      let lsKw_system_building = {};
      let bill_building = {};

      if (!dataPower) return;

      let lsDeviceFirst = [];
      let lsDeviceLast = [];

      for (let data of dataPower.slice().reverse()) {
        let building = data.building;
        let device = data.device;
        let kwh = Math.round((data.kwh * 100) / 100);
        let system = data.system;
        let floor = data.floor;

        if (system === "Main" && floor !== null) continue;

        if (!lsDeviceLast.find((d) => d === device) && kwh !== 0) {
          lsDeviceLast.push(device);
        } else continue;

        if (kwh_system_building[building] === undefined)
          kwh_system_building[building] = {};

        if (kwh_system_building[building][system] === undefined)
          kwh_system_building[building][system] = 0;

        kwh_system_building[building][system] += kwh;
      }

      for (let data of dataPower) {
        let datetime = new Date(data.data_datetime);
        let building = data.building;
        let device = data.device;
        let kwh = Math.round((data.kwh * 100) / 100);
        let kw = Math.round((data.kw * 100) / 100);
        let system = data.system;
        let floor = data.floor;

        if (system === "Main" && floor !== null) continue;

        if (lsKw_system_building[building] === undefined)
          lsKw_system_building[building] = {};

        if (lsKw_system_building[building][system] === undefined) {
          lsKw_system_building[building][system] = [];
        }

        lsKw_system_building[building][system].push({
          datetime: datetime,
          kw: kw,
        });

        if (!lsDeviceFirst.find((d) => d === device) && kwh !== 0)
          lsDeviceFirst.push(device);
        else continue;

        kwh_system_building[building][system] -= kwh;
      }

      for (let [building, kwh_system] of Object.entries(kwh_system_building)) {
        let tariff = 4;
        if (tariff_building[building] !== undefined) {
          if (tariff_building[building] !== null) {
            tariff = tariff_building[building];
          }
        }

        if (bill_building[building]) bill_building[building] = 0;
        bill_building[building] = kwh_system.Main * tariff;
      }

      this.setState({
        kwh_system_building: kwh_system_building,
        lsKw_system_building: lsKw_system_building,
        bill_building: bill_building,
      });
    });

    subscriberSolarData = subjectSolarData.subscribe((dataSolar) => {
      if (!dataSolar) return;
      if (dataSolar.length === 0) return;

      let kwhSolar = dataSolar[dataSolar.length - 1].kwh - dataSolar[0].kwh;

      this.setState({
        kwhSolar: kwhSolar,
      });
    });

    this.intervalTime = setInterval(
      () =>
        this.setState({
          currentTime: new Date()
            .toLocaleString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
            .replace("24:", "00:"),
        }),
      500
    );

    this.intervalApi = setInterval(() => {
      apiService.updatePowerMeterData();
      apiService.updateSolarData();
    }, 300000);
  }

  componentWillUnmount() {
    if (subscriberPowerMeterData) subscriberPowerMeterData.unsubscribe();
    if (subscriberSolarData) subscriberSolarData.unsubscribe();
    clearInterval(this.intervalTime);
    clearInterval(this.intervalApi);
  }

  async getAllSystem() {
    try {
      let resp = await http.get("/system/all");

      this.setState({ lsSystem: resp.data });
    } catch (err) {
      console.log(err);
      return err.response;
    }
  }

  async getAllTargetByMonthYear() {
    try {
      let today = new Date();
      let payload = {
        month: today.getMonth(),
        year: today.getFullYear(),
      };

      let resp = await http.post("/target/monthyear", payload);
      let lsTarget = resp.data;

      let tariff_building = {};
      let targetBill_building = {};
      for (let target of lsTarget) {
        let building = target.building;
        let tariff = target.tariff;
        let bill = target.electricity_bill;

        tariff_building[building] = tariff;
        targetBill_building[building] = bill;
      }

      this.setState({
        tariff_building: tariff_building,
        targetBill_building: targetBill_building,
      });
    } catch (err) {
      console.log(err);
      return err.response;
    }
  }

  async getAllBuilding() {
    try {
      let resp = await http.get("/building/all");

      this.setState({ lsBuilding: resp.data });
    } catch (err) {
      console.log(err);
      return err.response;
    }
  }

  async getPowerUsedCurrentMonthBuilding() {
    try {
      let month = new Date().getMonth();

      let payload = {
        month: month,
      };

      let resp = await http.post("/api/power/month", payload);

      this.setState({ kwhMonth_building: resp.data });
    } catch (err) {
      console.log(err);
      return err.response;
    }
  }

  async getSolarCurrentMonth() {
    try {
      let month = new Date().getMonth();

      let payload = {
        month: month,
      };

      let resp = await http.post("/api/solar/month", payload);

      this.setState({ kwhSolarMonth: resp.data.kwhSolar });
    } catch (err) {
      console.log(err);
      return err.response;
    }
  }

  async getVisitors() {
    try {
      let resp = await http.get("/etc/visitors");

      this.setState({
        visitors: resp.data,
      });
    } catch (err) {
      console.log(err);
      return err.response;
    }
  }

  onClickBuilding(building) {
    let { lsSelectedBuilding, lsBuilding } = this.state;

    if (lsSelectedBuilding.length === lsBuilding.length) {
      lsSelectedBuilding = [building];
    } else if (!lsSelectedBuilding.includes(building)) {
      lsSelectedBuilding.push(building);
      this.setState({ lsSelectedBuilding: lsSelectedBuilding });
    } else {
      lsSelectedBuilding = lsSelectedBuilding.filter((b) => b !== building);
    }

    this.setState({ lsSelectedBuilding: lsSelectedBuilding });
  }

  onDoubleClickBuilding(building) {
    this.props.history.push({ pathname: "building/", building: building });
  }

  toggleDisplayBill() {
    this.setState((prevState) => ({
      isDisplayBill: !prevState.isDisplayBill,
    }));
  }

  render() {
    let {
      currentTime,
      propsPath,
      buildingPath,
      lsBuilding,
      lsSelectedBuilding,
      kwh_system_building,
      lsKw_system_building,
      kwhSolar,
      kwhSolarMonth,
      bill_building,
      targetBill_building,
      kwhMonth_building,
      tariff_building,
      isDisplayBill,
      visitors,
    } = this.state;

    let kwhMainTotal = 0;
    let kwhAcTotal = 0;

    if (lsSelectedBuilding.length === 0) {
      lsSelectedBuilding = lsBuilding.map((building) => building.label);
    }

    for (let building of lsSelectedBuilding) {
      if (kwh_system_building[building]) {
        if (kwh_system_building[building]["Main"])
          kwhMainTotal += kwh_system_building[building]["Main"];

        if (kwh_system_building[building]["Air Conditioner"])
          kwhAcTotal += kwh_system_building[building]["Air Conditioner"];
      }
    }

    let billMonthTotal = 0;
    for (let [building, kwhMonth] of Object.entries(kwhMonth_building)) {
      if (!lsSelectedBuilding.includes(building)) continue;

      let tariff = 4;
      if (tariff_building[building]) tariff = tariff_building[building];

      let bill = kwhMonth * tariff;

      billMonthTotal += bill;
    }

    let target;
    for (let [building, targetBill] of Object.entries(targetBill_building)) {
      if (!lsSelectedBuilding.includes(building)) continue;
      if (!target) target = 0;
      target += targetBill;
    }

    let lsBuildingData = [];
    if (Object.values(kwh_system_building).length > 0) {
      let totalKwh = 0;
      Object.values(kwh_system_building).forEach(
        (kwh_system) => (totalKwh += kwh_system.Main)
      );
      for (let building of lsBuilding) {
        let kwh = kwh_system_building[building.label].Main;
        let kwhPercentage = parseFloat((kwh / totalKwh) * 100).toFixed(2);
        let percentColor = "#000";
        if (lsSelectedBuilding.includes(building.label)) {
          percentColor =
            "#" +
            colorConverter.pickHex(
              "d10909",
              "d1dbde",
              parseFloat(kwhPercentage / 100).toFixed(2)
            );
        }

        lsBuildingData.push({
          building: building.label,
          color: building.color_code,
          kwh: kwh,
          kwhPercentage: kwhPercentage,
          percentColor: percentColor,
        });
      }
    }

    const { t } = this.props;

    if (!lsSelectedBuilding.includes("Navamin")) {
      kwhSolar = 0;
      kwhSolarMonth = 0;
    }

    return (
      <div style={{ height: "100%" }}>
        {/* ****************************** Building Map Styles ******************************** */}
        {lsBuilding.map((building) => (
          <style>
            {`#img-${building.label
              .toLowerCase()
              .replace(" ", "-")} polygon[class^="st"],
							#img-${building.label.toLowerCase().replace(" ", "-")} path[class^="st"],
							#img-${building.label.toLowerCase().replace(" ", "-")} rect[class^="st"]{
								fill: #${
                  lsSelectedBuilding.length === lsBuilding.length
                    ? colorConverter.pickHex(
                        "d10909",
                        "d1dbde",
                        lsBuildingData.length > 0
                          ? parseFloat(
                              lsBuildingData.find(
                                (data) => data.building === building.label
                              ).kwhPercentage / 100
                            ).toFixed(2)
                          : "d1dbde"
                      )
                    : lsSelectedBuilding.includes(building.label)
                    ? building.color_code.replace("#", "")
                    : "d1dbde"
                }
							}`}
          </style>
        ))}
        <div
          id="container-home"
          style={{
            display:
              Object.values(lsKw_system_building).length > 0 ? "flex" : "",
          }}
          fluid
        >
          <Row>
            {/* ******************************** LEFT COLUMN ******************************** */}
            <Col sm="5" style={{ height: "100%" }} className="left-column">
              <div id="left-top-pane-group">
                {/* ******************************** ENERGY CONSUMPTION PANE ******************************** */}
                <div className="total-energy-consumption-pane">
                  <Row
                    style={{
                      height: "15%",
                      fontSize: "160%",
                      marginTop: "auto",
                    }}
                  >
                    <span>{t("home.Total")}</span>
                    <span
                      style={{
                        textTransform: "uppercase",
                        fontWeight: "bold",
                      }}
                    >
                      {t("home.EnergyConsumption")}
                    </span>
                  </Row>

                  <Row style={{ height: "20%" }}>
                    <span
                      style={{
                        fontSize: "160%",
                        fontWeight: "600",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      {t("home.Today")}
                    </span>
                    <span
                      style={{
                        fontSize: "125%",
                        display: "inline-flex",
                        alignItems: "center",
                        fontWeight: "500",
                      }}
                    >
                      00:00 - {currentTime}
                    </span>
                    <span style={{ fontSize: "200%", fontWeight: "bold" }}>
                      {numberFormatter.withCommas(Math.round(kwhMainTotal))}
                    </span>
                    <span
                      style={{
                        fontSize: "125%",
                        display: "inline-flex",
                        alignItems: "center",
                        fontWeight: "600",
                        paddingLeft: "0",
                      }}
                    >
                      {t("kWh")}
                    </span>
                  </Row>

                  <Row className="row-legend-pc">
                    <span
                      style={{
                        color: "#6B6666",
                        fontWeight: "600",
                        marginLeft: "5%",
                      }}
                    >
                      {t("From")}
                    </span>
                    <span className="dot-grey" />
                    <span
                      style={{
                        color: "#757272",
                        fontWeight: "500",
                        paddingLeft: "0.2rem",
                      }}
                    >
                      {t("MEA")}
                    </span>
                    <span className="dot-orange" />
                    <span
                      style={{
                        color: "#757272",
                        fontWeight: "500",
                        paddingLeft: "0.2rem",
                      }}
                    >
                      {t("Solar Cells")}
                    </span>

                    <span
                      style={{
                        color: "#6B6666",
                        fontWeight: "600",
                        marginLeft: "2%",
                      }}
                    >
                      {t("Used in")}
                    </span>
                    <span className="dot-blue" />
                    <span
                      style={{
                        color: "#757272",
                        fontWeight: "500",
                        paddingLeft: "0.3rem",
                      }}
                    >
                      {t("Air Conditioner")}
                    </span>
                    <span className="dot-red" />
                    <span
                      style={{
                        color: "#757272",
                        fontWeight: "500",
                        paddingLeft: "0.3rem",
                      }}
                    >
                      {t("Others")}
                    </span>
                  </Row>

                  <Row className="row-pie-charts">
                    <Col sm="6">
                      <PieChartEnergySource
                        mea={kwhMainTotal}
                        solar={kwhSolar}
                      />
                    </Col>
                    <Col sm="6">
                      <PieChartSystem
                        ac={kwhAcTotal}
                        others={kwhMainTotal - kwhAcTotal}
                        building={
                          lsSelectedBuilding.length === 1
                            ? lsSelectedBuilding[0]
                            : ""
                        }
                      />
                    </Col>
                  </Row>
                </div>
                {/* ******************************** ELECTRICITY BILL PANE ******************************** */}
                <div className="electricity-bill-pane">
                  <Row>
                    <Col sm="6">
                      <span
                        style={{
                          fontSize: "150%",
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        {t("Electricity Bill")}
                      </span>
                      <span
                        style={{
                          fontSize: "125%",
                          display: "inline-flex",
                          alignItems: "center",
                          fontWeight: "500",
                          paddingLeft: "1rem",
                        }}
                      >
                        {t("home.Month to Date")}
                      </span>
                    </Col>
                    <Col sm="6" style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: "150%",
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        {t("Total-2")}
                      </span>
                      <span
                        style={{
                          fontSize: "150%",
                          fontWeight: "600",
                          display: "inline-flex",
                          alignItems: "center",
                          paddingLeft: "1rem",
                        }}
                      >
                        ฿
                        {numberFormatter.withCommas(
                          parseFloat(billMonthTotal).toFixed(2)
                        )}
                      </span>
                    </Col>
                  </Row>
                  <Row style={{ textAlign: "center", fontWeight: "bold" }}>
                    <Col sm="4" style={{ color: "#DAA407" }}>
                      <span>{t("home.Saved From Solar")}</span>
                    </Col>
                    <Col sm="5" style={{ color: "#899CA2" }}>
                      <span>% {t("home.Electricity Used Month Target")}</span>
                    </Col>
                    <Col sm="3">
                      <span>{t("home.Target")}</span>
                    </Col>
                  </Row>
                  <Row style={{ textAlign: "center", fontWeight: "bold" }}>
                    <Col sm="3" style={{ color: "#FFC121" }}>
                      <span>
                        ฿ -{" "}
                        {numberFormatter.withCommas(
                          Math.abs(parseFloat(kwhSolarMonth * 4).toFixed(2))
                        )}
                      </span>
                    </Col>
                    <Col sm="6" style={{ color: "#899CA2" }}>
                      <span>
                        {target
                          ? parseFloat((billMonthTotal / target) * 100).toFixed(
                              2
                            )
                          : "N/A"}
                        %
                      </span>
                    </Col>
                    <Col sm="3">
                      <span>
                        ฿ {target ? numberFormatter.withCommas(target) : "N/A"}
                      </span>
                    </Col>
                  </Row>
                  <Row className="row-progress" style={{ paddingBottom: 0 }}>
                    <Col sm="3" style={{ paddingRight: 0 }}>
                      <Progress
                        color="warning"
                        value={
                          kwhSolarMonth === 0
                            ? 0
                            : ((Math.abs(kwhSolarMonth) * 4) /
                                (target === 0 ? 1 : target)) *
                              100
                        }
                        style={{
                          backgroundColor: "white",
                          borderRadius: "0",
                          direction: "rtl",
                          height: "20px",
                        }}
                      ></Progress>
                    </Col>
                    <Col sm="8" style={{ paddingLeft: 0 }}>
                      <Progress
                        color={billMonthTotal > target ? "danger" : "success"}
                        value={
                          (billMonthTotal / (target === 0 ? 1 : target)) * 100
                        }
                        style={{
                          backgroundColor: "white",
                          border: "solid 1px",
                          borderRadius: "0",
                          height: "20px",
                          fontWeight: "bold",
                        }}
                      >
                        ฿{" "}
                        {numberFormatter.withCommas(
                          parseFloat(billMonthTotal).toFixed(2)
                        )}
                      </Progress>
                    </Col>
                    <Col sm="1"></Col>
                  </Row>
                </div>
              </div>

              <div id="left-bottom-pane-group">
                {/* ******************************** BUILDING POWER CONSUMPTION PANE ******************************** */}
                <div className="building-power-consumption-pane">
                  <LineChartBuildingPowerConsumption
                    lsSelectedBuilding={lsSelectedBuilding}
                    lsKw_system_building={lsKw_system_building}
                    lsBuilding={lsBuilding}
                  />
                </div>
                {/* ******************************** ELECTRICAL SYSTEM POWER CONSUMPTION PANE ******************************** */}
                <div className="electrical-system-power-consumption-pane">
                  <BarChartSystemPowerConsumption
                    lsSelectedBuilding={lsSelectedBuilding}
                    lsKw_system_building={lsKw_system_building}
                    lsBuilding={lsBuilding}
                  />
                </div>
              </div>
            </Col>

            {/* ******************************** RIGHT COLUMN ******************************** */}
            <Col sm="7" className="right-column">
              <Row className="row-top-right">
                <Col sm="6">
                  <input
                    type="checkbox"
                    id="chk-bill"
                    checked={isDisplayBill}
                    onChange={this.toggleDisplayBill}
                  />
                  <label id="label-bill">{t("Electricity Bill")}</label>
                </Col>
                <Col sm="6" id="col-visitors">
                  <IoMdPeople size={"2rem"} />
                  <span id="num-visitors">{visitors}</span>
                </Col>
              </Row>

              <div className="row-building-block">
                {lsBuilding.map((building) => (
                  <div className="col-building-block">
                    {lsBuildingData.length > 0 ? (
                      <span className="span-building-block">
                        {isDisplayBill ? (
                          <div className="bill-building">
                            ฿{" "}
                            {numberFormatter.withCommas(
                              Math.round(bill_building[building.label])
                            )}
                          </div>
                        ) : (
                          ""
                        )}
                        <div
                          className="label-building"
                          style={{
                            backgroundColor: `#${
                              lsSelectedBuilding.length === lsBuilding.length
                                ? colorConverter.pickHex(
                                    "d10909",
                                    "d1dbde",
                                    lsBuildingData.length > 0
                                      ? parseFloat(
                                          lsBuildingData.find(
                                            (data) =>
                                              data.building === building.label
                                          ).kwhPercentage / 100
                                        ).toFixed(2)
                                      : "d1dbde"
                                  )
                                : lsSelectedBuilding.includes(building.label)
                                ? building.color_code.replace("#", "")
                                : "d1dbde"
                            }`,
                            color:
                              lsSelectedBuilding.length === lsBuilding.length
                                ? "black"
                                : lsSelectedBuilding.includes(building.label)
                                ? "white"
                                : "black",
                          }}
                          onClick={() => this.onClickBuilding(building.label)}
                          onDoubleClick={() =>
                            this.onDoubleClickBuilding(building.label)
                          }
                        >
                          {t(`${building.label}`)}
                        </div>
                        <div
                          className="kwh-building"
                          style={{
                            color: lsBuildingData.find(
                              (data) => data.building === building.label
                            ).kwhColor,
                          }}
                        >
                          {
                            lsBuildingData.find(
                              (data) => data.building === building.label
                            ).kwh
                          }{" "}
                          {t("kWh")}
                        </div>
                        <div
                          className="percentKwh-building"
                          style={{
                            color:
                              lsSelectedBuilding.length === lsBuilding.length
                                ? lsBuildingData.find(
                                    (data) => data.building === building.label
                                  ).percentColor
                                : lsSelectedBuilding.includes(building.label)
                                ? "black"
                                : "#d1dbde",
                          }}
                        >
                          {
                            lsBuildingData.find(
                              (data) => data.building === building.label
                            ).kwhPercentage
                          }
                          %
                        </div>
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                ))}
              </div>

              <div className="map-campus">
                <img
                  className="img-road-1"
                  src={propsPath + "road1.png"}
                  alt={"road.png"}
                ></img>
                <img
                  className="img-road-2"
                  src={propsPath + "road2.png"}
                  alt={"road2.png"}
                ></img>
                <img
                  className="img-road-campus"
                  src={propsPath + "road-campus.png"}
                  alt={"in-road.png"}
                ></img>
                <img
                  className="img-field"
                  src={propsPath + "field.png"}
                  alt={"field.png"}
                ></img>
                <img
                  className="img-pond"
                  src={propsPath + "pond.png"}
                  alt={"pond.png"}
                ></img>
                <img
                  className="img-trees"
                  src={propsPath + "trees.png"}
                  alt={"trees.png"}
                ></img>
                {lsBuilding.map((building) => (
                  <ReactSVG
                    afterInjection={(error) => {
                      if (error) {
                        console.log(error);
                        return;
                      }
                    }}
                    id={"img-" + building.label.toLowerCase().replace(" ", "-")}
                    className={"img-building"}
                    src={
                      buildingPath +
                      building.label +
                      "/" +
                      building.label +
                      ".svg"
                    }
                    wrapper="div"
                  />
                ))}
              </div>

              {/* ******************************* Map Footer ******************************** */}
              <div className="footer">
                <Row style={{ height: "100%" }}>
                  <Col sm="6" style={{ display: "flex" }}>
                    <span
                      style={{
                        textDecoration: "underline",
                        alignSelf: "flex-end",
                      }}
                    >
                      *{t("Note")}:
                    </span>
                    <span
                      style={{
                        alignSelf: "flex-end",
                        marginLeft: "0.2rem",
                      }}
                    >
                      {t("Electricity bill is estimated")}
                    </span>
                  </Col>
                  <Col sm="3" style={{ verticalAlign: "bottom" }}>
                    <Row
                      style={{
                        marginTop: "2rem",
                        fontWeight: "bold",
                        justifyContent: "center",
                        marginBottom: 0,
                      }}
                    >
                      {t("Color Legend")}
                    </Row>
                    <Row
                      style={{
                        marginBottom: 0,
                        justifyContent: "center",
                      }}
                    >
                      *{t("From Total Energy")}
                    </Row>
                  </Col>
                  <Col sm="3">
                    <Row>
                      <Container className="dot-container">
                        <div className="legend-dot-1"></div>
                      </Container>
                      <Container className="dot-container">
                        <div className="legend-dot-2"></div>
                      </Container>
                      <Container className="dot-container">
                        <div className="legend-dot-3"></div>
                      </Container>
                    </Row>
                    <Row>
                      <div className="legend gradient"></div>
                    </Row>
                    <Row
                      style={{
                        justifyContent: "center",
                        paddingLeft: "0.5rem",
                      }}
                    >
                      <span className="legend-percentage">0%</span>
                      <span className="legend-percentage">30%</span>
                      <span className="legend-percentage">60%</span>
                      <span className="legend-percentage">100%</span>
                    </Row>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default withTranslation()(Home);
