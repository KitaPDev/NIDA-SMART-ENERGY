const dotenv = require("dotenv");
const axios = require("axios");
const dateFormatter = require("../utils/dateFormatter");
const apiService = require("../services/api.service");
const deviceService = require("../services/device.service");

const baseUrl = process.env.NIDA_API_BASE_URL;
const axiosInstance = axios.create({
  baseURL: baseUrl + "/api/powermeter",
});

let accessToken = "";

const dateZero = new Date(2021, 5, 22);

let updateDataDelay = 5000;

async function start(dateZero) {
  setTimeout(updateDataPower, updateDataDelay, dateZero);
}

function setAccessToken(token) {
  accessToken = token;
}

async function updateDataPower() {
  if (accessToken.length === 0) {
    setTimeout(updateDataPower, updateDataDelay);
    return;
  }

  try {
    let dataPower = await apiService.getLatestLogPowerMeter();

    let dateStart = new Date(dateZero);

    if (dataPower !== undefined && dataPower !== null) {
      if (dataPower.data_datetime !== undefined) {
        if (new Date(dataPower.data_datetime).getTime() > dateStart.getTime()) {
          dateStart = new Date(dataPower.data_datetime);
        }
      }
    }

    if (dateStart.getTime() > dateZero.getTime()) {
      dateStart.setSeconds(dateStart.getSeconds() + 1);
    }

    let dateEnd = new Date(dateStart.getTime() + 43200000);

    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + accessToken,
    };

    const postData = {
      startdatetime: dateFormatter.yyyymmddhhmmss(dateStart),
      enddatetime: dateFormatter.yyyymmddhhmmss(dateEnd),
    };

    let resp = await axiosInstance.post("/datetime", postData, {
      headers: headers,
    });

    let data = resp.data.data;

    let lsDeviceID = await deviceService.getAllPowerMeterDeviceID();

    let lsLogPowerMeter = [];
    for (let [_, value] of Object.entries(data)) {
      if (!lsDeviceID.includes(value["Device"])) continue;

      let logPowerMeter = {};

      logPowerMeter["data_datetime"] = value["DataDateTime"];
      logPowerMeter["device_id"] = value["Device"];
      logPowerMeter["current_l1"] = value["Current_L1"];
      logPowerMeter["current_l2"] = value["Current_L2"];
      logPowerMeter["current_l3"] = value["Current_L3"];
      logPowerMeter["hz"] = value["Hz"];
      logPowerMeter["kva_l1"] = value["kVA_L1"];
      logPowerMeter["kva_l2"] = value["kVA_L2"];
      logPowerMeter["kva_l3"] = value["kVA_L3"];
      logPowerMeter["kva_total"] = value["kVA_Total"];
      logPowerMeter["kvar_l1"] = value["kVar_L1"];
      logPowerMeter["kvar_l2"] = value["kVar_L2"];
      logPowerMeter["kvar_l3"] = value["kVar_L3"];
      logPowerMeter["kvar_total"] = value["kVar_Total"];
      logPowerMeter["kw_l1"] = value["kW_L1"];
      logPowerMeter["kw_l2"] = value["kW_L2"];
      logPowerMeter["kw_l3"] = value["kW_L3"];
      logPowerMeter["kw_total"] = value["kW_Total"];
      logPowerMeter["pf"] = value["PF"];
      logPowerMeter["pf1"] = value["PF1"];
      logPowerMeter["pf2"] = value["PF2"];
      logPowerMeter["pf3"] = value["PF3"];
      logPowerMeter["thd_current_avg"] = value["THD_Current_Avg"];
      logPowerMeter["thd_current_l1"] = value["THD_Current_L1"];
      logPowerMeter["thd_current_l2"] = value["THD_Current_L2"];
      logPowerMeter["thd_current_l3"] = value["THD_Current_L3"];
      logPowerMeter["thd_voltage_avg"] = value["THD_Voltage_Avg"];
      logPowerMeter["thd_voltage_l1"] = value["THD_Voltage_L1"];
      logPowerMeter["thd_voltage_l2"] = value["THD_Voltage_L2"];
      logPowerMeter["thd_voltage_l3"] = value["THD_Voltage_L3"];
      logPowerMeter["voltage_l1_l2"] = value["Voltage_L1-L2"];
      logPowerMeter["voltage_l1_N"] = value["Voltage_L1-N"];
      logPowerMeter["voltage_l2_l3"] = value["Voltage_L2-L3"];
      logPowerMeter["voltage_l2_N"] = value["Voltage_L2-N"];
      logPowerMeter["voltage_l3_l1"] = value["Voltage_L3-L1"];
      logPowerMeter["voltage_l3_N"] = value["Voltage_L3-N"];
      logPowerMeter["kvah"] = value["kVAh"];
      logPowerMeter["kvarh"] = value["kVArh"];
      logPowerMeter["kwh"] = value["kWh"];
      logPowerMeter["demand_kw"] = value["Demand_kW"];
      logPowerMeter["peak_kw_max_demand"] = value["Peak_kW_Max_Demand"];

      lsLogPowerMeter.push(logPowerMeter);
    }

    if (lsLogPowerMeter.length > 0) {
      await apiService.insertLogPowerMeter(lsLogPowerMeter);
    } else {
      updateDataDelay = 600000;
    }
  } catch (err) {
    console.log(err);
    updateDataDelay = 5000;
  }
  setTimeout(updateDataPower, updateDataDelay);
}

module.exports = {
  start,
  setAccessToken,
  updateDataPower,
};
