const apiService = require("../services/api.service");
const httpStatusCodes = require("http-status-codes").StatusCodes;

async function getDataPowerMeterByDatetime(req, res) {
  try {
    let body = req.body;
    let start = body.start;
    let end = body.end;

    if (!start && !end) {
      return res
        .status(httpStatusCodes.FORBIDDEN)
        .send("Please provide start and end datetimes.");
    }

    let result = await apiService.getDataPowerMeter(start, end);

    return res.status(httpStatusCodes.OK).send(result);
  } catch (err) {
    console.log(err);
    return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getDataSolarByDatetime(req, res) {
  try {
    let body = req.body;
    let start = body.start;
    let end = body.end;

    if (!start && !end) {
      return res
        .status(httpStatusCodes.FORBIDDEN)
        .send("Please provide start and end datetimes.");
    }

    let result = await apiService.getDataSolar(start, end);

    return res.status(httpStatusCodes.OK).send(result);
  } catch (err) {
    console.log(err);
    return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getDataIaqByDatetime(req, res) {
  try {
    let body = req.body;
    let start = body.start;
    let end = body.end;

    if (!start && !end) {
      return res
        .status(httpStatusCodes.FORBIDDEN)
        .send("Please provide start and end datetimes.");
    }

    let result = await apiService.getDataIaq(start, end);

    return res.status(httpStatusCodes.OK).send(result);
  } catch (err) {
    console.log(err);
    return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getDataPowerMonthBuilding(req, res) {
  try {
    let body = req.body;
    let month = body.month;

    if (month === undefined) {
      return res.status(httpStatusCodes.FORBIDDEN).send("Month is required.");
    }

    let lsData = await apiService.getDataPowerMonth(month);

    let monthKwh_system_building = {};
    let lsPrevDeviceMain = [];
    let lsPrevDeviceAc = [];
    for (let data of lsData.slice().reverse()) {
      let system = data.system;
      let building = data.building;
      let kwh = data.kwh;

      if (
        lsPrevDeviceMain.includes(data.device) ||
        lsPrevDeviceAc.includes(data.device) ||
        kwh === null
      ) {
        continue;
      }

      if (!monthKwh_system_building[building]) {
        monthKwh_system_building[building] = {};
      }

      if (!monthKwh_system_building[building][system]) {
        monthKwh_system_building[building][system] = 0;
      }

      monthKwh_system_building[building][system] += kwh;

      if (system === "Main") lsPrevDeviceMain.push(data.device);
      if (system === "Air Conditioner") lsPrevDeviceAc.push(data.device);
    }

    lsPrevDeviceMain = [];
    lsPrevDeviceAc = [];
    for (let data of lsData) {
      let system = data.system;
      let building = data.building;
      let kwh = data.kwh;

      if (
        lsPrevDeviceMain.includes(data.device) ||
        lsPrevDeviceAc.includes(data.device) ||
        kwh === null
      ) {
        continue;
      }
      monthKwh_system_building[building][system] -= kwh;

      if (system === "Main") lsPrevDeviceMain.push(data.device);
      if (system === "Air Conditioner") lsPrevDeviceAc.push(data.device);
    }

    return res.status(httpStatusCodes.OK).send(monthKwh_system_building);
  } catch (err) {
    console.log(err);
    return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getDataSolarMonth(req, res) {
  try {
    let body = req.body;
    let month = body.month;

    if (month === undefined) {
      return res.status(httpStatusCodes.FORBIDDEN).send("Month is required.");
    }

    let lsData = await apiService.getDataSolarMonth(month);

    let kwhSolar = lsData[lsData.length - 1].kwh - lsData[0].kwh;

    return res.status(httpStatusCodes.OK).send({ kwhSolar });
  } catch (err) {
    console.log(err);
    return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getBillCompare(req, res) {
  try {
    let body = req.body;
    let dateFrom = new Date(body.date_from);
    let dateTo = new Date(body.date_to);

    let data = await apiService.getBillCompareData(dateFrom, dateTo);

    let bill_building_date = {};
    let lsLog_date_month_year = data.lsLog_date_month_year;
    let lsTarget = data.lsTarget;

    for (let [year, lsLog_date_month] of Object.entries(
      lsLog_date_month_year
    )) {
      for (let [month, lsLog_date] of Object.entries(lsLog_date_month)) {
        for (let [d, lsLog] of Object.entries(lsLog_date)) {
          let date = new Date(year, month, d);
          let strDate = date.toString();

          let lsPrevDevice = [];
          for (let log of lsLog.slice().reverse()) {
            let building = log.building;
            let device = log.device;
            let kwh = log.kwh;
            let system = log.system;

            if (
              system !== "Main" ||
              lsPrevDevice.includes(device) ||
              kwh === null
            ) {
              continue;
            }
            lsPrevDevice.push(device);

            if (!bill_building_date[strDate]) {
              bill_building_date[strDate] = {};
            }
            let bill_building = bill_building_date[strDate];

            if (!bill_building[building]) bill_building[building] = 0;
            bill_building[building] += kwh;
          }

          lsPrevDevice = [];
          for (let log of lsLog) {
            let building = log.building;
            let device = log.device;
            let kwh = log.kwh;
            let system = log.system;

            if (
              system !== "Main" ||
              lsPrevDevice.includes(device) ||
              kwh === null
            ) {
              continue;
            }
            lsPrevDevice.push(device);

            bill_building_date[strDate][building] -= kwh;
          }
        }
      }
    }

    for (let [strDate, bill_building] of Object.entries(bill_building_date)) {
      let date = new Date(strDate);

      for (let [building, bill] of Object.entries(bill_building)) {
        let tariff = 4;
        let target = lsTarget.find((target) => {
          if (target !== undefined) {
            return (
              target.month === date.getMonth() &&
              target.year === date.getFullYear() &&
              target.building === building
            );
          }
        });
        if (target !== undefined) {
          if (target.tariff !== null) tariff = target.tariff;
        }
        bill_building_date[strDate][building] = bill * tariff;
      }
    }

    return res
      .status(httpStatusCodes.OK)
      .send({ bill_building_date, lsTarget });
  } catch (err) {
    console.log(err);
    return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

async function getEnergy(_, res) {
  try {
    let lsLog = await apiService.getEnergy();

    let energy = 0;

    let kwhYesterday = 0;
    let kwhLastYearMonthAverage = 0;

    let lsPrevDevice_yesterday = [];
    let lsPrevDevice_lastYear = [];
    let today = new Date();
    for (let log of lsLog) {
      let date = new Date(log.data_datetime);
      let device = log.device;
      let kwh = log.kwh;

      let year = date.getFullYear();
      if (year === today.getFullYear()) {
        if (!lsPrevDevice_yesterday.includes(device)) {
          kwhYesterday += kwh;
          lsPrevDevice_yesterday.push(device);
        }
      }

      if (year === today.getFullYear() - 1) {
        if (!lsPrevDevice_lastYear.includes(device)) {
          kwhLastYearMonthAverage += kwh;
          lsPrevDevice_lastYear.push(device);
        }
      }
    }

    lsPrevDevice_yesterday = [];
    lsPrevDevice_lastYear = [];
    for (let log of lsLog.slice().reverse()) {
      let date = new Date(log.data_datetime);
      let device = log.device;
      let kwh = log.kwh;

      let year = date.getFullYear();
      if (year === today.getFullYear()) {
        if (!lsPrevDevice_yesterday.includes(device)) {
          kwhYesterday -= kwh;
          lsPrevDevice_yesterday.push(device);
        }
      }

      if (year === today.getFullYear() - 1) {
        if (!lsPrevDevice_lastYear.includes(device)) {
          kwhLastYearMonthAverage -= kwh;
          lsPrevDevice_lastYear.push(device);
        }
      }
    }

    if (today.getFullYear() === 2021) {
      switch (today.getMonth()) {
        case 8:
          kwhLastYearMonthAverage = 698000;
          break;
        case 9:
          kwhLastYearMonthAverage = 658000;
          break;
        case 10:
          kwhLastYearMonthAverage = 645000;
          break;
        case 11:
          kwhLastYearMonthAverage = 606000;
          break;
      }
    }

    if (today.getFullYear() === 2022) {
      switch (today.getMonth()) {
        case 0:
          kwhLastYearMonthAverage = 372000;
          break;
        case 1:
          kwhLastYearMonthAverage = 511000;
          break;
        case 2:
          kwhLastYearMonthAverage = 707000;
          break;
        case 3:
          kwhLastYearMonthAverage = 352000;
          break;
        case 4:
          kwhLastYearMonthAverage = 383000;
          break;
        case 5:
          kwhLastYearMonthAverage = 417000;
          break;
      }
    }

    kwhLastYearMonthAverage /= new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();

    if (kwhLastYearMonthAverage !== 0) {
      energy =
        (kwhLastYearMonthAverage - kwhYesterday) / kwhLastYearMonthAverage;
    }

    return res
      .status(httpStatusCodes.OK)
      .send({ energy: energy, diff: kwhYesterday - kwhLastYearMonthAverage });
  } catch (err) {
    console.log(err);
    return res.sendStatus(httpStatusCodes.INTERNAL_SERVER_ERROR);
  }
}

module.exports = {
  getDataPowerMeterByDatetime,
  getDataSolarByDatetime,
  getDataIaqByDatetime,
  getDataPowerMonthBuilding,
  getDataSolarMonth,
  getBillCompare,
  getEnergy,
};
