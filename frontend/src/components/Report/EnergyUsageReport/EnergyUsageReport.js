import React from "react";

import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
  Svg,
  Rect,
} from "@react-pdf/renderer";

import dateFormatter from "../../../utils/dateFormatter";

import { withTranslation } from "react-i18next";
import numberFormatter from "../../../utils/numberFormatter";

Font.register({
  family: "THSarabunNew",
  fonts: [
    { src: "/THSarabunNew/THSarabunNew.ttf" },
    { src: "/THSarabunNew/THSarabunNew Bold.ttf", fontWeight: "bold" },
    {
      src: "/THSarabunNew/THSarabunNew Italic.ttf",
      fontStyle: "italic",
      fontWeight: "normal",
    },
    {
      src: "/THSarabunNew/THSarabunNew BoldItalic.ttf",
      fontStyle: "italic",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "THSarabunNew",
  },
  header: {
    borderBottom: "1px solid #000",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 30,
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 10,
  },
  title: { fontSize: 18, fontWeight: "bold" },
  stamp: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  date: { fontSize: 10, marginBottom: 3, fontWeight: "bold" },
  logo: { width: 90 },

  body: {
    display: "flex",
    flexDirection: "column",
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  line: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  // red: { color: "red" },
  lineCenter: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  pieChart: {
    height: 300,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    marginLeft: 10,
  },
});

class EnergyUsageReport extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dateFrom: this.props.dateFrom,
      dateTo: this.props.dateTo,
      lsSelectedBuilding: this.props.lsSelectedBuilding,
      lsBuilding: this.props.lsBuilding,
      kwh_system_building: this.props.kwh_system_building,
      kwhSolar: this.props.kwhSolar,
      bill_system_building: this.props.bill_system_building,
      b64PieChartBuildingEnergyUsage: this.props.b64PieChartBuildingEnergyUsage,
    };
  }

  render() {
    let {
      dateFrom,
      dateTo,
      lsSelectedBuilding,
      lsBuilding,
      kwh_system_building,
      kwhSolar,
      bill_system_building,
      b64PieChartBuildingEnergyUsage,
    } = this.state;

    const { t } = this.props;

    let kwhMainTotal = 0;
    let kwhAcTotal = 0;
    let kwhOthersTotal = 0;

    for (let kwh_system of Object.values(kwh_system_building)) {
      kwhMainTotal += kwh_system["Main"];
      if (kwh_system["Air Conditioner"]) {
        kwhAcTotal += kwh_system["Air Conditioner"];
      }
    }

    kwhOthersTotal = kwhMainTotal - kwhAcTotal;

    let billTotal = 0;
    for (let bill_system of Object.values(bill_system_building)) {
      billTotal += bill_system["Main"];
    }

    if (!lsSelectedBuilding.includes("Navamin")) {
      kwhSolar = 0;
    }

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("Energy Usage Report")}</Text>
            <View style={styles.stamp}>
              <Text style={styles.date}>
                {t("Date")}: {dateFormatter.ddmmyyyy_noOffset(new Date())}
              </Text>
              <Image style={styles.logo} source={"/report-logo.jpg"} />
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.section}>
              <View style={styles.line}>
                <Text>{t("From")} </Text>
                <Text style={styles.red}>
                  {dateFormatter.ddmmyyyyhhmm_noOffset(dateFrom) + " "}
                </Text>
                <Text>{t("To")} </Text>
                <Text style={styles.red}>
                  {dateFormatter.ddmmyyyyhhmm_noOffset(dateTo)}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.line}>
                <Text>
                  {t("Building") + " "}
                  {lsSelectedBuilding.length === lsBuilding.length ? (
                    <Text style={styles.red}>{t("All")}</Text>
                  ) : (
                    <Text style={styles.red}>
                      {lsSelectedBuilding.map(
                        (bld, idx) =>
                          t(bld) +
                          (idx === lsSelectedBuilding.length - 1 ? "" : ", ")
                      )}
                    </Text>
                  )}
                </Text>
              </View>
              <View style={styles.line}>
                <Text>{t("System")} </Text>
                <Text style={styles.red}>{t("All")}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.line}>
                <Text>{t(`NIDA's energy usage from`) + " "}</Text>
                <Text style={styles.red}>
                  {dateFormatter.ddmmyyyyhhmm_noOffset(dateFrom) + " "}
                </Text>
                <Text>{t("to") + " "}</Text>
                <Text style={styles.red}>
                  {dateFormatter.ddmmyyyyhhmm_noOffset(dateTo)}
                </Text>
              </View>
              <View style={styles.line}>
                <Text>{t("By building") + " "}</Text>
                <Text>
                  {lsSelectedBuilding.length === lsBuilding.length ? (
                    <Text style={styles.red}>{t("All") + " "}</Text>
                  ) : (
                    <Text style={styles.red}>
                      {lsSelectedBuilding.map(
                        (bld, idx) =>
                          t(bld) +
                          (idx === lsSelectedBuilding.length - 1 ? "" : ", ")
                      )}
                      <Text> </Text>
                    </Text>
                  )}
                </Text>
                <Text> {t("with total energy usage of")}</Text>
                <Text style={styles.red}>
                  {" "}
                  {numberFormatter.withCommas(
                    parseFloat(kwhMainTotal - Math.abs(kwhSolar)).toFixed(2)
                  )}
                </Text>
                <Text> {t("kWh")}</Text>
              </View>
              <View style={styles.line}>
                <Text>{t("used in")} </Text>
                <Text>{t("Air Conditioning")} </Text>
                <Text style={styles.red}>
                  {numberFormatter.withCommas(
                    parseFloat(kwhAcTotal).toFixed(2)
                  )}{" "}
                </Text>
                <Text>{t("kWh")} </Text>
                <Text>{t("calculated as")} </Text>
                <Text style={styles.red}>
                  {numberFormatter.withCommas(
                    parseFloat((kwhAcTotal / kwhMainTotal) * 100).toFixed(2)
                  )}
                  %
                </Text>
              </View>
              <View style={styles.line}>
                <Text>{t("and in")} </Text>
                <Text>{t("Others")} </Text>
                <Text style={styles.red}>
                  {numberFormatter.withCommas(
                    parseFloat(kwhOthersTotal).toFixed(2)
                  )}{" "}
                </Text>
                <Text>{t("kWh")} </Text>
                <Text>{t("calculated as")} </Text>
                <Text style={styles.red}>
                  {numberFormatter.withCommas(
                    parseFloat((kwhOthersTotal / kwhMainTotal) * 100).toFixed(2)
                  )}
                  %
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.line}>
                <Text>{t("Energy sourced from (MEA)")} </Text>
                <Text style={styles.red}>
                  {numberFormatter.withCommas(
                    parseFloat(kwhMainTotal).toFixed(2)
                  )}{" "}
                </Text>
                <Text>{t("kWh")} </Text>
                <Text>{t("calculated as")} </Text>
                <Text style={styles.red}>
                  {parseFloat(
                    (kwhMainTotal / (kwhMainTotal + kwhSolar)) * 100
                  ).toFixed(2)}
                  %
                </Text>
              </View>
              <View style={styles.line}>
                <Text>{t("and from Solar Cells (PV)")} </Text>
                <Text style={styles.red}>
                  {numberFormatter.withCommas(parseFloat(kwhSolar).toFixed(2))}{" "}
                </Text>
                <Text>{t("kWh")} </Text>
                <Text>{t("calculated as")} </Text>
                <Text style={styles.red}>
                  {parseFloat(
                    (kwhSolar / (kwhMainTotal + kwhSolar)) * 100
                  ).toFixed(2)}
                  %
                </Text>
              </View>
              <View style={styles.line}>
                <Text>{t("Resulting in an electricity bill of")} </Text>
                <Text style={styles.red}>
                  {numberFormatter.withCommas(parseFloat(billTotal).toFixed(2))}{" "}
                </Text>
                <Text>{t("Baht")}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.line}>
                <Text>
                  {t(
                    "The percentage of each building's energy usage are described in the figure below."
                  )}
                </Text>
              </View>
              <View style={styles.lineCenter}>
                <View>
                  <Image
                    style={styles.pieChart}
                    src={b64PieChartBuildingEnergyUsage}
                  />
                </View>
                <View style={styles.column}>
                  {lsSelectedBuilding.map((bld) => (
                    <View style={styles.line}>
                      <Svg width="20" height="20">
                        <Rect
                          width="15"
                          height="15"
                          fill={
                            lsBuilding.find((b) => b.label === bld).color_code
                          }
                        />
                      </Svg>
                      <Text>{t(bld)} </Text>
                      <Text style={styles.red}>
                        {numberFormatter.withCommas(
                          Math.round(kwh_system_building[bld]["Main"])
                        )}{" "}
                      </Text>
                      <Text>{t("kWh")} </Text>
                      <Text style={styles.red}>
                        (
                        {parseFloat(
                          (Math.round(kwh_system_building[bld]["Main"]) /
                            kwhMainTotal) *
                            100
                        ).toFixed(2)}
                        %)
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </Page>
      </Document>
    );
  }
}

export default withTranslation()(EnergyUsageReport);
