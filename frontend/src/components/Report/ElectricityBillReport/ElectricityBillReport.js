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
import numberFormatter from "../../../utils/numberFormatter";
import { lsMonthFull } from "../../../utils/months";

import { withTranslation } from "react-i18next";
import i18n from "../../../i18n";

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
  date: { color: "red", fontSize: 10, marginBottom: 5, fontWeight: "bold" },
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
  red: { color: "red" },
  barChart: {
    height: 200,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    marginLeft: 10,
  },

  table: {
    display: "table",
    margin: "auto",
  },
  tableRow: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "100%",
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 0.5,
    borderTopWidth: 1.5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  tableColHeader15: {
    width: "15%",
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 0.5,
    borderLeftWidth: 1.5,
    borderTopWidth: 1.5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  tableColHeader30: {
    width: "30%",
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 0.5,
    textAlign: "center",
  },
  tableColHeader40: {
    width: "40%",
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 0.5,
    textAlign: "center",
  },
  tableColHeader42_5: {
    width: "42.5%",
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 0.5,
  },
  tableCol15: {
    width: "15%",
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 0.5,
    borderLeftWidth: 1.5,
    textAlign: "left",
    paddingLeft: 2,
  },
  tableCol30: {
    width: "30%",
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 0.5,
    textAlign: "center",
  },
  tableCol40: {
    width: "40%",
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 0.5,
    textAlign: "center",
  },
  tableCol42_5: {
    width: "42.5%",
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 0.5,
  },
  tableCellHeader: {
    fontSize: 16,
    fontWeight: 600,
  },
  tableCellHeaderRed: {
    fontSize: 16,
    fontWeight: 800,
    color: "red",
  },
  tableCell: {
    fontSize: 16,
  },
  tableCellRed: {
    fontSize: 16,
    color: "red",
  },

  tableCellTotal: {
    fontSize: 16,
    fontWeight: 600,
    backgroundColor: "#FFF2CC",
  },
  tableCellTotalRed: {
    fontSize: 16,
    fontWeight: 800,
    color: "red",
    backgroundColor: "#FFF2CC",
  },
});

class ElectricityBillReport extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dateFrom: this.props.dateFrom,
      dateTo: this.props.dateTo,
      lsSelectedBuilding: this.props.lsSelectedBuilding,
      lsBuilding: this.props.lsBuilding,
      bill_building_month_year: this.props.bill_building_month_year,
      lsTarget: this.props.lsTarget,
      b64BarChartBuildingElectricityBill:
        this.props.b64BarChartBuildingElectricityBill,
    };
  }

  render() {
    let {
      dateFrom,
      dateTo,
      lsSelectedBuilding,
      lsBuilding,
      lsTarget,
      bill_building_month_year,
      b64BarChartBuildingElectricityBill,
    } = this.state;

    const { t } = this.props;

    let monthDiff = (dateFrom.getFullYear() - dateTo.getFullYear()) * 12;
    monthDiff -= dateFrom.getMonth();
    monthDiff += dateTo.getMonth();
    if (monthDiff < 0) monthDiff = 0;

    let count = 0;

    let displayDateFrom = new Date(
      dateFrom.getFullYear(),
      dateFrom.getMonth(),
      0,
      0,
      0
    );

    let displayDateTo = new Date(
      dateTo.getFullYear(),
      dateTo.getMonth() + 1,
      0,
      0,
      0
    );

    if (dateTo.getTime() > new Date().getTime()) displayDateTo = new Date();

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("Electricity Bill Report")}</Text>
            <View style={styles.stamp}>
              <Text style={styles.date}>
                {t("Date")}: {dateFormatter.ddmmyyyy(new Date())}
              </Text>
              <Image style={styles.logo} source={"/report-logo.jpg"} />
            </View>
          </View>

          <View style={styles.body}>
            <View style={styles.section}>
              <View style={styles.line}>
                <Text>{t("From")} </Text>
                <Text style={styles.red}>
                  {dateFormatter.ddmmyyyy(displayDateFrom) + " "}
                </Text>
                <Text>{t("To")} </Text>
                <Text style={styles.red}>
                  {dateFormatter.ddmmyyyyhhmm_noOffset(displayDateTo)}
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
            </View>

            <View style={styles.section}>
              <View style={styles.line}>
                <Text>{t("NIDA's electricity bill from")} </Text>
                <Text style={styles.red}>
                  {t(lsMonthFull[dateFrom.getMonth()])}{" "}
                </Text>
                <Text style={styles.red}>
                  {i18n.language === "th"
                    ? dateFrom.getFullYear() + 543
                    : dateFrom.getFullYear()}{" "}
                </Text>
                <Text>{t("to")} </Text>
                <Text style={styles.red}>
                  {t(lsMonthFull[dateTo.getMonth()])}{" "}
                </Text>
                <Text style={styles.red}>
                  {i18n.language === "th"
                    ? dateTo.getFullYear() + 543
                    : dateTo.getFullYear()}
                </Text>
              </View>
              <View style={styles.line}>
                <Text>{t("is shown below")}</Text>
              </View>
              <View style={styles.line}>
                <Image
                  style={styles.barChart}
                  src={b64BarChartBuildingElectricityBill}
                />
                <View style={styles.column}>
                  {lsSelectedBuilding.map((bld) => (
                    <View style={styles.line}>
                      <Svg width="10" height="10" style={{ marginRight: 5 }}>
                        <Rect
                          width="10"
                          height="10"
                          fill={
                            lsBuilding.find((b) => b.label === bld).color_code
                          }
                        />
                      </Svg>
                      <Text style={{ fontSize: 14 }}>{t(bld)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.line}>
                <Text>{t("Electricity Bill Table")}</Text>
              </View>

              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <View style={styles.tableColHeader15}>
                    <Text style={styles.tableCellHeader}>{t("Building")}</Text>
                  </View>
                  {Object.keys(bill_building_month_year).map((year) => {
                    let bill_building_month = bill_building_month_year[year];

                    return Object.keys(bill_building_month).map((month) => {
                      if (count >= 2) return;
                      count++;

                      return (
                        <View style={styles.tableColHeader42_5}>
                          <View style={styles.tableRow}>
                            <View style={styles.tableColHeader}>
                              <Text style={styles.tableCellHeaderRed}>
                                {`${t(lsMonthFull[month])} ${
                                  i18n.language === "th" ? +year + 543 : year
                                }`}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.tableRow}>
                            <View style={styles.tableColHeader30}>
                              <Text style={styles.tableCellHeader}>
                                {t("Bill (Baht)")}
                              </Text>
                            </View>
                            <View style={styles.tableColHeader30}>
                              <Text style={styles.tableCellHeader}>
                                {t("Target")}
                              </Text>
                            </View>
                            <View style={styles.tableColHeader40}>
                              <Text style={styles.tableCellHeader}>
                                {t("% Target")}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    });
                  })}
                </View>
                {lsSelectedBuilding.map((bld) => (
                  <View style={styles.tableRow}>
                    <View style={styles.tableCol15}>
                      <Text style={styles.tableCellHeaderRed}>{t(bld)}</Text>
                    </View>

                    {Object.keys(bill_building_month_year).map((year) => {
                      let bill_building_month = bill_building_month_year[year];
                      count = 0;

                      return Object.keys(bill_building_month).map((month) => {
                        if (count >= 2) return;
                        count++;

                        return (
                          <View style={styles.tableCol42_5}>
                            <View style={styles.tableRow}>
                              <View style={styles.tableCol30}>
                                <Text style={styles.tableCellRed}>
                                  {numberFormatter.withCommas(
                                    Math.round(bill_building_month[month][bld])
                                  )}
                                </Text>
                              </View>
                              <View style={styles.tableCol30}>
                                <Text style={styles.tableCellRed}>
                                  {lsTarget.find(
                                    (t) =>
                                      t.year === +year &&
                                      t.month === +month &&
                                      t.building === bld
                                  )
                                    ? lsTarget.find(
                                        (t) =>
                                          t.year === +year &&
                                          t.month === +month &&
                                          t.building === bld
                                      ).electricity_bill !== null
                                      ? numberFormatter.withCommas(
                                          lsTarget.find(
                                            (t) =>
                                              t.year === +year &&
                                              t.month === +month &&
                                              t.building === bld
                                          ).electricity_bill
                                        )
                                      : "-"
                                    : "-"}
                                </Text>
                              </View>
                              <View style={styles.tableCol40}>
                                <Text style={styles.tableCellRed}>
                                  {lsTarget.find(
                                    (t) =>
                                      t.year === +year &&
                                      t.month === +month &&
                                      t.building === bld
                                  )
                                    ? lsTarget.find(
                                        (t) =>
                                          t.year === +year &&
                                          t.month === +month &&
                                          t.building === bld
                                      ).electricity_bill !== null
                                      ? `${
                                          lsTarget.find(
                                            (t) =>
                                              t.year === +year &&
                                              t.month === +month &&
                                              t.building === bld
                                          ).electricity_bill >
                                          bill_building_month[month][bld]
                                            ? "+"
                                            : ""
                                        }${parseFloat(
                                          ((lsTarget.find(
                                            (t) =>
                                              t.year === +year &&
                                              t.month === +month &&
                                              t.building === bld
                                          ).electricity_bill -
                                            bill_building_month[month][bld]) /
                                            lsTarget.find(
                                              (t) =>
                                                t.year === +year &&
                                                t.month === +month &&
                                                t.building === bld
                                            ).electricity_bill) *
                                            100
                                        ).toFixed(2)}%`
                                      : "-"
                                    : "-"}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      });
                    })}
                  </View>
                ))}
                <View style={styles.tableRow}>
                  <View style={styles.tableCol15}>
                    <Text style={styles.tableCellTotal}>{t("Total")}</Text>
                  </View>
                  {Object.keys(bill_building_month_year).map((year) => {
                    let bill_building_month = bill_building_month_year[year];
                    count = 0;

                    return Object.keys(bill_building_month).map((month) => {
                      if (count >= 2) return;
                      count++;

                      return (
                        <View style={styles.tableCol42_5}>
                          <View style={styles.tableRow}>
                            <View style={styles.tableCol30}>
                              <Text style={styles.tableCellTotalRed}>
                                {numberFormatter.withCommas(
                                  Math.round(
                                    Object.values(
                                      bill_building_month[month]
                                    ).reduce((a, b) => a + b)
                                  )
                                )}
                              </Text>
                            </View>
                            <View style={styles.tableCol30}>
                              <Text style={styles.tableCellTotalRed}>
                                {numberFormatter.withCommas(
                                  Math.round(
                                    lsTarget.length > 0
                                      ? lsTarget.reduce(function (a, b) {
                                          if (Number.isInteger(a)) {
                                            if (
                                              b.year === +year &&
                                              b.month === +month
                                            ) {
                                              return a + b.electricity_bill;
                                            }
                                            return a + 0;
                                          }

                                          if (
                                            b.year === +year &&
                                            b.month === +month &&
                                            a.year === +year &&
                                            a.month === +month
                                          ) {
                                            return (
                                              a.electricity_bill +
                                              b.electricity_bill
                                            );
                                          }

                                          return 0;
                                        })
                                      : "-"
                                  )
                                )}
                              </Text>
                            </View>
                            <View style={styles.tableCol40}>
                              {lsTarget.length > 0 ? (
                                <Text style={styles.tableCellTotalRed}>
                                  {lsTarget.reduce(function (a, b) {
                                    if (Number.isInteger(a)) {
                                      if (
                                        b.year === +year &&
                                        b.month === +month
                                      ) {
                                        return a + b.electricity_bill;
                                      }
                                      return a + 0;
                                    }

                                    if (
                                      b.year === +year &&
                                      b.month === +month &&
                                      a.year === +year &&
                                      a.month === +month
                                    ) {
                                      return (
                                        a.electricity_bill + b.electricity_bill
                                      );
                                    }

                                    return 0;
                                  }) -
                                    Math.round(
                                      Object.values(
                                        bill_building_month[month]
                                      ).reduce((a, b) => a + b)
                                    ) >
                                  0
                                    ? "+"
                                    : ""}
                                  {numberFormatter.withCommas(
                                    parseFloat(
                                      ((lsTarget.reduce(function (a, b) {
                                        if (Number.isInteger(a)) {
                                          if (
                                            b.year === +year &&
                                            b.month === +month
                                          ) {
                                            return a + b.electricity_bill;
                                          }
                                          return a + 0;
                                        }

                                        if (
                                          b.year === +year &&
                                          b.month === +month &&
                                          a.year === +year &&
                                          a.month === +month
                                        ) {
                                          return (
                                            a.electricity_bill +
                                            b.electricity_bill
                                          );
                                        }

                                        return 0;
                                      }) -
                                        Math.round(
                                          Object.values(
                                            bill_building_month[month]
                                          ).reduce((a, b) => a + b)
                                        )) /
                                        lsTarget.reduce(function (a, b) {
                                          if (Number.isInteger(a)) {
                                            if (
                                              b.year === +year &&
                                              b.month === +month
                                            ) {
                                              return a + b.electricity_bill;
                                            }
                                            return a + 0;
                                          }

                                          if (
                                            b.year === +year &&
                                            b.month === +month &&
                                            a.year === +year &&
                                            a.month === +month
                                          ) {
                                            return (
                                              a.electricity_bill +
                                              b.electricity_bill
                                            );
                                          }

                                          return 0;
                                        })) *
                                        100
                                    ).toFixed(2)
                                  )}
                                  %
                                </Text>
                              ) : (
                                <Text style={styles.tableCellTotalRed}>-</Text>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    });
                  })}
                </View>
              </View>
            </View>
          </View>
        </Page>

        {monthDiff > 1 ? (
          <Page size="A4" style={styles.page}>
            <View style={{ marginTop: 30 }} />
            <View style={styles.body}>
              <View style={styles.section}>
                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <View style={styles.tableColHeader15}>
                      <Text style={styles.tableCellHeader}>
                        {t("Building")}
                      </Text>
                    </View>
                    {Object.keys(bill_building_month_year).map((year) => {
                      let bill_building_month = bill_building_month_year[year];
                      if (count === 2) count = 0;

                      return Object.keys(bill_building_month).map((month) => {
                        if (count < 2) {
                          count++;
                          return;
                        }

                        if (count >= 4) return;
                        count++;

                        return (
                          <View style={styles.tableColHeader42_5}>
                            <View style={styles.tableRow}>
                              <View style={styles.tableColHeader}>
                                <Text style={styles.tableCellHeaderRed}>
                                  {`${t(lsMonthFull[month])} ${
                                    i18n.language === "th" ? +year + 543 : year
                                  }`}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.tableRow}>
                              <View style={styles.tableColHeader30}>
                                <Text style={styles.tableCellHeader}>
                                  {t("Bill (Baht)")}
                                </Text>
                              </View>
                              <View style={styles.tableColHeader30}>
                                <Text style={styles.tableCellHeader}>
                                  {t("Target")}
                                </Text>
                              </View>
                              <View style={styles.tableColHeader40}>
                                <Text style={styles.tableCellHeader}>
                                  {t("% Target")}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      });
                    })}
                  </View>
                  {lsSelectedBuilding.map((bld) => (
                    <View style={styles.tableRow}>
                      <View style={styles.tableCol15}>
                        <Text style={styles.tableCellHeaderRed}>{t(bld)}</Text>
                      </View>

                      {Object.keys(bill_building_month_year).map((year) => {
                        let bill_building_month =
                          bill_building_month_year[year];
                        count = 0;

                        return Object.keys(bill_building_month).map((month) => {
                          if (count < 2) {
                            count++;
                            return;
                          }

                          if (count >= 4) return;
                          count++;

                          return (
                            <View style={styles.tableCol42_5}>
                              <View style={styles.tableRow}>
                                <View style={styles.tableCol30}>
                                  <Text style={styles.tableCellRed}>
                                    {numberFormatter.withCommas(
                                      Math.round(
                                        bill_building_month[month][bld]
                                      )
                                    )}
                                  </Text>
                                </View>
                                <View style={styles.tableCol30}>
                                  <Text style={styles.tableCellRed}>
                                    {lsTarget.find(
                                      (t) =>
                                        t.year === +year &&
                                        t.month === +month &&
                                        t.building === bld
                                    )
                                      ? lsTarget.find(
                                          (t) =>
                                            t.year === +year &&
                                            t.month === +month &&
                                            t.building === bld
                                        ).electricity_bill !== null
                                        ? numberFormatter.withCommas(
                                            lsTarget.find(
                                              (t) =>
                                                t.year === +year &&
                                                t.month === +month &&
                                                t.building === bld
                                            ).electricity_bill
                                          )
                                        : "-"
                                      : "-"}
                                  </Text>
                                </View>
                                <View style={styles.tableCol40}>
                                  {lsTarget.length > 0 ? (
                                    <Text style={styles.tableCellTotalRed}>
                                      {lsTarget.reduce(function (a, b) {
                                        if (Number.isInteger(a)) {
                                          if (
                                            b.year === +year &&
                                            b.month === +month
                                          ) {
                                            return a + b.electricity_bill;
                                          }
                                          return a + 0;
                                        }

                                        if (
                                          b.year === +year &&
                                          b.month === +month &&
                                          a.year === +year &&
                                          a.month === +month
                                        ) {
                                          return (
                                            a.electricity_bill +
                                            b.electricity_bill
                                          );
                                        }

                                        return 0;
                                      }) -
                                        Math.round(
                                          Object.values(
                                            bill_building_month[month]
                                          ).reduce((a, b) => a + b)
                                        ) >
                                      0
                                        ? "+"
                                        : ""}
                                      {numberFormatter.withCommas(
                                        parseFloat(
                                          ((lsTarget.reduce(function (a, b) {
                                            if (Number.isInteger(a)) {
                                              if (
                                                b.year === +year &&
                                                b.month === +month
                                              ) {
                                                return a + b.electricity_bill;
                                              }
                                              return a + 0;
                                            }

                                            if (
                                              b.year === +year &&
                                              b.month === +month &&
                                              a.year === +year &&
                                              a.month === +month
                                            ) {
                                              return (
                                                a.electricity_bill +
                                                b.electricity_bill
                                              );
                                            }

                                            return 0;
                                          }) -
                                            Math.round(
                                              Object.values(
                                                bill_building_month[month]
                                              ).reduce((a, b) => a + b)
                                            )) /
                                            lsTarget.reduce(function (a, b) {
                                              if (Number.isInteger(a)) {
                                                if (
                                                  b.year === +year &&
                                                  b.month === +month
                                                ) {
                                                  return a + b.electricity_bill;
                                                }
                                                return a + 0;
                                              }

                                              if (
                                                b.year === +year &&
                                                b.month === +month &&
                                                a.year === +year &&
                                                a.month === +month
                                              ) {
                                                return (
                                                  a.electricity_bill +
                                                  b.electricity_bill
                                                );
                                              }

                                              return 0;
                                            })) *
                                            100
                                        ).toFixed(2)
                                      )}
                                      %
                                    </Text>
                                  ) : (
                                    <Text style={styles.tableCellTotalRed}>
                                      -
                                    </Text>
                                  )}
                                </View>
                              </View>
                            </View>
                          );
                        });
                      })}
                    </View>
                  ))}
                  <View style={styles.tableRow}>
                    <View style={styles.tableCol15}>
                      <Text style={styles.tableCellTotal}>{t("Total")}</Text>
                    </View>
                    {Object.keys(bill_building_month_year).map((year) => {
                      let bill_building_month = bill_building_month_year[year];
                      count = 0;

                      return Object.keys(bill_building_month).map((month) => {
                        if (count < 2) {
                          count++;
                          return;
                        }

                        if (count >= 4) return;
                        count++;

                        return (
                          <View style={styles.tableCol42_5}>
                            <View style={styles.tableRow}>
                              <View style={styles.tableCol30}>
                                <Text style={styles.tableCellTotalRed}>
                                  {numberFormatter.withCommas(
                                    Math.round(
                                      Object.values(
                                        bill_building_month[month]
                                      ).reduce((a, b) => a + b)
                                    )
                                  )}
                                </Text>
                              </View>
                              <View style={styles.tableCol30}>
                                <Text style={styles.tableCellTotalRed}>
                                  {numberFormatter.withCommas(
                                    Math.round(
                                      lsTarget.length > 0
                                        ? lsTarget.reduce(function (a, b) {
                                            if (Number.isInteger(a)) {
                                              if (
                                                b.year === +year &&
                                                b.month === +month
                                              ) {
                                                return a + b.electricity_bill;
                                              }
                                              return a + 0;
                                            }

                                            if (
                                              b.year === +year &&
                                              b.month === +month &&
                                              a.year === +year &&
                                              a.month === +month
                                            ) {
                                              return (
                                                a.electricity_bill +
                                                b.electricity_bill
                                              );
                                            }

                                            return 0;
                                          })
                                        : "-"
                                    )
                                  )}
                                </Text>
                              </View>
                              <View style={styles.tableCol40}>
                                {lsTarget.length > 0 ? (
                                  <Text style={styles.tableCellTotalRed}>
                                    {lsTarget.reduce(function (a, b) {
                                      if (Number.isInteger(a)) {
                                        if (
                                          b.year === +year &&
                                          b.month === +month
                                        ) {
                                          return a + b.electricity_bill;
                                        }
                                        return a + 0;
                                      }

                                      if (
                                        b.year === +year &&
                                        b.month === +month &&
                                        a.year === +year &&
                                        a.month === +month
                                      ) {
                                        return (
                                          a.electricity_bill +
                                          b.electricity_bill
                                        );
                                      }

                                      return 0;
                                    }) -
                                      Math.round(
                                        Object.values(
                                          bill_building_month[month]
                                        ).reduce((a, b) => a + b)
                                      ) >
                                    0
                                      ? "+"
                                      : ""}
                                    {numberFormatter.withCommas(
                                      parseFloat(
                                        ((lsTarget.reduce(function (a, b) {
                                          if (Number.isInteger(a)) {
                                            if (
                                              b.year === +year &&
                                              b.month === +month
                                            ) {
                                              return a + b.electricity_bill;
                                            }
                                            return a + 0;
                                          }

                                          if (
                                            b.year === +year &&
                                            b.month === +month &&
                                            a.year === +year &&
                                            a.month === +month
                                          ) {
                                            return (
                                              a.electricity_bill +
                                              b.electricity_bill
                                            );
                                          }

                                          return 0;
                                        }) -
                                          Math.round(
                                            Object.values(
                                              bill_building_month[month]
                                            ).reduce((a, b) => a + b)
                                          )) /
                                          lsTarget.reduce(function (a, b) {
                                            if (Number.isInteger(a)) {
                                              if (
                                                b.year === +year &&
                                                b.month === +month
                                              ) {
                                                return a + b.electricity_bill;
                                              }
                                              return a + 0;
                                            }

                                            if (
                                              b.year === +year &&
                                              b.month === +month &&
                                              a.year === +year &&
                                              a.month === +month
                                            ) {
                                              return (
                                                a.electricity_bill +
                                                b.electricity_bill
                                              );
                                            }

                                            return 0;
                                          })) *
                                          100
                                      ).toFixed(2)
                                    )}
                                    %
                                  </Text>
                                ) : (
                                  <Text style={styles.tableCellTotalRed}>
                                    -
                                  </Text>
                                )}
                              </View>
                            </View>
                          </View>
                        );
                      });
                    })}
                  </View>
                </View>
              </View>

              {monthDiff > 3 ? (
                <View style={styles.section}>
                  <View style={styles.table}>
                    <View style={styles.tableRow}>
                      <View style={styles.tableColHeader15}>
                        <Text style={styles.tableCellHeader}>
                          {t("Building")}
                        </Text>
                      </View>
                      {Object.keys(bill_building_month_year).map((year) => {
                        let bill_building_month =
                          bill_building_month_year[year];
                        if (count === 4) count = 0;

                        return Object.keys(bill_building_month).map((month) => {
                          if (count < 4) {
                            count++;
                            return;
                          }

                          if (count >= 6) return;
                          count++;

                          return (
                            <View style={styles.tableColHeader42_5}>
                              <View style={styles.tableRow}>
                                <View style={styles.tableColHeader}>
                                  <Text style={styles.tableCellHeaderRed}>
                                    {`${t(lsMonthFull[month])} ${
                                      i18n.language === "th"
                                        ? +year + 543
                                        : year
                                    }`}
                                  </Text>
                                </View>
                              </View>
                              <View style={styles.tableRow}>
                                <View style={styles.tableColHeader30}>
                                  <Text style={styles.tableCellHeader}>
                                    {t("Bill (Baht)")}
                                  </Text>
                                </View>
                                <View style={styles.tableColHeader30}>
                                  <Text style={styles.tableCellHeader}>
                                    {t("Target")}
                                  </Text>
                                </View>
                                <View style={styles.tableColHeader40}>
                                  <Text style={styles.tableCellHeader}>
                                    {t("% Target")}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          );
                        });
                      })}
                    </View>
                    {lsSelectedBuilding.map((bld) => (
                      <View style={styles.tableRow}>
                        <View style={styles.tableCol15}>
                          <Text style={styles.tableCellHeaderRed}>
                            {t(bld)}
                          </Text>
                        </View>

                        {Object.keys(bill_building_month_year).map((year) => {
                          let bill_building_month =
                            bill_building_month_year[year];
                          count = 0;

                          return Object.keys(bill_building_month).map(
                            (month) => {
                              if (count < 4) {
                                count++;
                                return;
                              }

                              if (count >= 6) return;
                              count++;

                              return (
                                <View style={styles.tableCol42_5}>
                                  <View style={styles.tableRow}>
                                    <View style={styles.tableCol30}>
                                      <Text style={styles.tableCellRed}>
                                        {numberFormatter.withCommas(
                                          Math.round(
                                            bill_building_month[month][bld]
                                          )
                                        )}
                                      </Text>
                                    </View>
                                    <View style={styles.tableCol30}>
                                      <Text style={styles.tableCellRed}>
                                        {lsTarget.find(
                                          (t) =>
                                            t.year === +year &&
                                            t.month === +month &&
                                            t.building === bld
                                        )
                                          ? lsTarget.find(
                                              (t) =>
                                                t.year === +year &&
                                                t.month === +month &&
                                                t.building === bld
                                            ).electricity_bill !== null
                                            ? numberFormatter.withCommas(
                                                lsTarget.find(
                                                  (t) =>
                                                    t.year === +year &&
                                                    t.month === +month &&
                                                    t.building === bld
                                                ).electricity_bill
                                              )
                                            : "-"
                                          : "-"}
                                      </Text>
                                    </View>
                                    <View style={styles.tableCol40}>
                                      {lsTarget.length > 0 ? (
                                        <Text style={styles.tableCellTotalRed}>
                                          {lsTarget.reduce(function (a, b) {
                                            if (Number.isInteger(a)) {
                                              if (
                                                b.year === +year &&
                                                b.month === +month
                                              ) {
                                                return a + b.electricity_bill;
                                              }
                                              return a + 0;
                                            }

                                            if (
                                              b.year === +year &&
                                              b.month === +month &&
                                              a.year === +year &&
                                              a.month === +month
                                            ) {
                                              return (
                                                a.electricity_bill +
                                                b.electricity_bill
                                              );
                                            }

                                            return 0;
                                          }) -
                                            Math.round(
                                              Object.values(
                                                bill_building_month[month]
                                              ).reduce((a, b) => a + b)
                                            ) >
                                          0
                                            ? "+"
                                            : ""}
                                          {numberFormatter.withCommas(
                                            parseFloat(
                                              ((lsTarget.reduce(function (
                                                a,
                                                b
                                              ) {
                                                if (Number.isInteger(a)) {
                                                  if (
                                                    b.year === +year &&
                                                    b.month === +month
                                                  ) {
                                                    return (
                                                      a + b.electricity_bill
                                                    );
                                                  }
                                                  return a + 0;
                                                }

                                                if (
                                                  b.year === +year &&
                                                  b.month === +month &&
                                                  a.year === +year &&
                                                  a.month === +month
                                                ) {
                                                  return (
                                                    a.electricity_bill +
                                                    b.electricity_bill
                                                  );
                                                }

                                                return 0;
                                              }) -
                                                Math.round(
                                                  Object.values(
                                                    bill_building_month[month]
                                                  ).reduce((a, b) => a + b)
                                                )) /
                                                lsTarget.reduce(function (
                                                  a,
                                                  b
                                                ) {
                                                  if (Number.isInteger(a)) {
                                                    if (
                                                      b.year === +year &&
                                                      b.month === +month
                                                    ) {
                                                      return (
                                                        a + b.electricity_bill
                                                      );
                                                    }
                                                    return a + 0;
                                                  }

                                                  if (
                                                    b.year === +year &&
                                                    b.month === +month &&
                                                    a.year === +year &&
                                                    a.month === +month
                                                  ) {
                                                    return (
                                                      a.electricity_bill +
                                                      b.electricity_bill
                                                    );
                                                  }

                                                  return 0;
                                                })) *
                                                100
                                            ).toFixed(2)
                                          )}
                                          %
                                        </Text>
                                      ) : (
                                        <Text style={styles.tableCellTotalRed}>
                                          -
                                        </Text>
                                      )}
                                    </View>
                                  </View>
                                </View>
                              );
                            }
                          );
                        })}
                      </View>
                    ))}
                    <View style={styles.tableRow}>
                      <View style={styles.tableCol15}>
                        <Text style={styles.tableCellTotal}>{t("Total")}</Text>
                      </View>
                      {Object.keys(bill_building_month_year).map((year) => {
                        let bill_building_month =
                          bill_building_month_year[year];
                        count = 0;

                        return Object.keys(bill_building_month).map((month) => {
                          if (count < 4) {
                            count++;
                            return;
                          }

                          if (count >= 6) return;
                          count++;

                          return (
                            <View style={styles.tableCol42_5}>
                              <View style={styles.tableRow}>
                                <View style={styles.tableCol30}>
                                  <Text style={styles.tableCellTotalRed}>
                                    {numberFormatter.withCommas(
                                      Math.round(
                                        Object.values(
                                          bill_building_month[month]
                                        ).reduce((a, b) => a + b)
                                      )
                                    )}
                                  </Text>
                                </View>
                                <View style={styles.tableCol30}>
                                  <Text style={styles.tableCellTotalRed}>
                                    {numberFormatter.withCommas(
                                      Math.round(
                                        lsTarget.length > 0
                                          ? lsTarget.reduce(function (a, b) {
                                              if (Number.isInteger(a)) {
                                                if (
                                                  b.year === +year &&
                                                  b.month === +month
                                                ) {
                                                  return a + b.electricity_bill;
                                                }
                                                return a + 0;
                                              }

                                              if (
                                                b.year === +year &&
                                                b.month === +month &&
                                                a.year === +year &&
                                                a.month === +month
                                              ) {
                                                return (
                                                  a.electricity_bill +
                                                  b.electricity_bill
                                                );
                                              }

                                              return 0;
                                            })
                                          : "-"
                                      )
                                    )}
                                  </Text>
                                </View>
                                <View style={styles.tableCol40}>
                                  {lsTarget.length > 0 ? (
                                    <Text style={styles.tableCellTotalRed}>
                                      {lsTarget.reduce(function (a, b) {
                                        if (Number.isInteger(a)) {
                                          if (
                                            b.year === +year &&
                                            b.month === +month
                                          ) {
                                            return a + b.electricity_bill;
                                          }
                                          return a + 0;
                                        }

                                        if (
                                          b.year === +year &&
                                          b.month === +month &&
                                          a.year === +year &&
                                          a.month === +month
                                        ) {
                                          return (
                                            a.electricity_bill +
                                            b.electricity_bill
                                          );
                                        }

                                        return 0;
                                      }) -
                                        Math.round(
                                          Object.values(
                                            bill_building_month[month]
                                          ).reduce((a, b) => a + b)
                                        ) >
                                      0
                                        ? "+"
                                        : ""}
                                      {numberFormatter.withCommas(
                                        parseFloat(
                                          ((lsTarget.reduce(function (a, b) {
                                            if (Number.isInteger(a)) {
                                              if (
                                                b.year === +year &&
                                                b.month === +month
                                              ) {
                                                return a + b.electricity_bill;
                                              }
                                              return a + 0;
                                            }

                                            if (
                                              b.year === +year &&
                                              b.month === +month &&
                                              a.year === +year &&
                                              a.month === +month
                                            ) {
                                              return (
                                                a.electricity_bill +
                                                b.electricity_bill
                                              );
                                            }

                                            return 0;
                                          }) -
                                            Math.round(
                                              Object.values(
                                                bill_building_month[month]
                                              ).reduce((a, b) => a + b)
                                            )) /
                                            lsTarget.reduce(function (a, b) {
                                              if (Number.isInteger(a)) {
                                                if (
                                                  b.year === +year &&
                                                  b.month === +month
                                                ) {
                                                  return a + b.electricity_bill;
                                                }
                                                return a + 0;
                                              }

                                              if (
                                                b.year === +year &&
                                                b.month === +month &&
                                                a.year === +year &&
                                                a.month === +month
                                              ) {
                                                return (
                                                  a.electricity_bill +
                                                  b.electricity_bill
                                                );
                                              }

                                              return 0;
                                            })) *
                                            100
                                        ).toFixed(2)
                                      )}
                                      %
                                    </Text>
                                  ) : (
                                    <Text style={styles.tableCellTotalRed}>
                                      -
                                    </Text>
                                  )}
                                </View>
                              </View>
                            </View>
                          );
                        });
                      })}
                    </View>
                  </View>
                </View>
              ) : (
                <Text></Text>
              )}
            </View>
          </Page>
        ) : (
          <Text></Text>
        )}

        {monthDiff > 5 ? (
          <Page size="A4" style={styles.page}>
            <View style={{ marginTop: 30 }} />
            <View style={styles.body}>
              <View style={styles.section}>
                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <View style={styles.tableColHeader15}>
                      <Text style={styles.tableCellHeader}>
                        {t("Building")}
                      </Text>
                    </View>
                    {Object.keys(bill_building_month_year).map((year) => {
                      let bill_building_month = bill_building_month_year[year];
                      if (count === 6) count = 0;

                      return Object.keys(bill_building_month).map((month) => {
                        if (count < 6) {
                          count++;
                          return;
                        }

                        if (count >= 8) return;
                        count++;

                        return (
                          <View style={styles.tableColHeader42_5}>
                            <View style={styles.tableRow}>
                              <View style={styles.tableColHeader}>
                                <Text style={styles.tableCellHeaderRed}>
                                  {`${t(lsMonthFull[month])} ${
                                    i18n.language === "th" ? +year + 543 : year
                                  }`}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.tableRow}>
                              <View style={styles.tableColHeader30}>
                                <Text style={styles.tableCellHeader}>
                                  {t("Bill (Baht)")}
                                </Text>
                              </View>
                              <View style={styles.tableColHeader30}>
                                <Text style={styles.tableCellHeader}>
                                  {t("Target")}
                                </Text>
                              </View>
                              <View style={styles.tableColHeader40}>
                                <Text style={styles.tableCellHeader}>
                                  {t("% Target")}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      });
                    })}
                  </View>
                  {lsSelectedBuilding.map((bld) => (
                    <View style={styles.tableRow}>
                      <View style={styles.tableCol15}>
                        <Text style={styles.tableCellHeaderRed}>{t(bld)}</Text>
                      </View>

                      {Object.keys(bill_building_month_year).map((year) => {
                        let bill_building_month =
                          bill_building_month_year[year];
                        count = 0;

                        return Object.keys(bill_building_month).map((month) => {
                          if (count < 6) {
                            count++;
                            return;
                          }

                          if (count >= 8) return;
                          count++;

                          return (
                            <View style={styles.tableCol42_5}>
                              <View style={styles.tableRow}>
                                <View style={styles.tableCol30}>
                                  <Text style={styles.tableCellRed}>
                                    {numberFormatter.withCommas(
                                      Math.round(
                                        bill_building_month[month][bld]
                                      )
                                    )}
                                  </Text>
                                </View>
                                <View style={styles.tableCol30}>
                                  <Text style={styles.tableCellRed}>
                                    {lsTarget.find(
                                      (t) =>
                                        t.year === +year &&
                                        t.month === +month &&
                                        t.building === bld
                                    )
                                      ? lsTarget.find(
                                          (t) =>
                                            t.year === +year &&
                                            t.month === +month &&
                                            t.building === bld
                                        ).electricity_bill !== null
                                        ? numberFormatter.withCommas(
                                            lsTarget.find(
                                              (t) =>
                                                t.year === +year &&
                                                t.month === +month &&
                                                t.building === bld
                                            ).electricity_bill
                                          )
                                        : "-"
                                      : "-"}
                                  </Text>
                                </View>
                                <View style={styles.tableCol40}>
                                  {lsTarget.length > 0 ? (
                                    <Text style={styles.tableCellTotalRed}>
                                      {lsTarget.reduce(function (a, b) {
                                        if (Number.isInteger(a)) {
                                          if (
                                            b.year === +year &&
                                            b.month === +month
                                          ) {
                                            return a + b.electricity_bill;
                                          }
                                          return a + 0;
                                        }

                                        if (
                                          b.year === +year &&
                                          b.month === +month &&
                                          a.year === +year &&
                                          a.month === +month
                                        ) {
                                          return (
                                            a.electricity_bill +
                                            b.electricity_bill
                                          );
                                        }

                                        return 0;
                                      }) -
                                        Math.round(
                                          Object.values(
                                            bill_building_month[month]
                                          ).reduce((a, b) => a + b)
                                        ) >
                                      0
                                        ? "+"
                                        : ""}
                                      {numberFormatter.withCommas(
                                        parseFloat(
                                          ((lsTarget.reduce(function (a, b) {
                                            if (Number.isInteger(a)) {
                                              if (
                                                b.year === +year &&
                                                b.month === +month
                                              ) {
                                                return a + b.electricity_bill;
                                              }
                                              return a + 0;
                                            }

                                            if (
                                              b.year === +year &&
                                              b.month === +month &&
                                              a.year === +year &&
                                              a.month === +month
                                            ) {
                                              return (
                                                a.electricity_bill +
                                                b.electricity_bill
                                              );
                                            }

                                            return 0;
                                          }) -
                                            Math.round(
                                              Object.values(
                                                bill_building_month[month]
                                              ).reduce((a, b) => a + b)
                                            )) /
                                            lsTarget.reduce(function (a, b) {
                                              if (Number.isInteger(a)) {
                                                if (
                                                  b.year === +year &&
                                                  b.month === +month
                                                ) {
                                                  return a + b.electricity_bill;
                                                }
                                                return a + 0;
                                              }

                                              if (
                                                b.year === +year &&
                                                b.month === +month &&
                                                a.year === +year &&
                                                a.month === +month
                                              ) {
                                                return (
                                                  a.electricity_bill +
                                                  b.electricity_bill
                                                );
                                              }

                                              return 0;
                                            })) *
                                            100
                                        ).toFixed(2)
                                      )}
                                      %
                                    </Text>
                                  ) : (
                                    <Text style={styles.tableCellTotalRed}>
                                      -
                                    </Text>
                                  )}
                                </View>
                              </View>
                            </View>
                          );
                        });
                      })}
                    </View>
                  ))}
                  <View style={styles.tableRow}>
                    <View style={styles.tableCol15}>
                      <Text style={styles.tableCellTotal}>{t("Total")}</Text>
                    </View>
                    {Object.keys(bill_building_month_year).map((year) => {
                      let bill_building_month = bill_building_month_year[year];
                      count = 0;

                      return Object.keys(bill_building_month).map((month) => {
                        if (count < 6) {
                          count++;
                          return;
                        }

                        if (count >= 8) return;
                        count++;

                        return (
                          <View style={styles.tableCol42_5}>
                            <View style={styles.tableRow}>
                              <View style={styles.tableCol30}>
                                <Text style={styles.tableCellTotalRed}>
                                  {numberFormatter.withCommas(
                                    Math.round(
                                      Object.values(
                                        bill_building_month[month]
                                      ).reduce((a, b) => a + b)
                                    )
                                  )}
                                </Text>
                              </View>
                              <View style={styles.tableCol30}>
                                <Text style={styles.tableCellTotalRed}>
                                  {numberFormatter.withCommas(
                                    Math.round(
                                      lsTarget.length > 0
                                        ? lsTarget.reduce(function (a, b) {
                                            if (Number.isInteger(a)) {
                                              if (
                                                b.year === +year &&
                                                b.month === +month
                                              ) {
                                                return a + b.electricity_bill;
                                              }
                                              return a + 0;
                                            }

                                            if (
                                              b.year === +year &&
                                              b.month === +month &&
                                              a.year === +year &&
                                              a.month === +month
                                            ) {
                                              return (
                                                a.electricity_bill +
                                                b.electricity_bill
                                              );
                                            }

                                            return 0;
                                          })
                                        : "-"
                                    )
                                  )}
                                </Text>
                              </View>
                              <View style={styles.tableCol40}>
                                {lsTarget.length > 0 ? (
                                  <Text style={styles.tableCellTotalRed}>
                                    {lsTarget.reduce(function (a, b) {
                                      if (Number.isInteger(a)) {
                                        if (
                                          b.year === +year &&
                                          b.month === +month
                                        ) {
                                          return a + b.electricity_bill;
                                        }
                                        return a + 0;
                                      }

                                      if (
                                        b.year === +year &&
                                        b.month === +month &&
                                        a.year === +year &&
                                        a.month === +month
                                      ) {
                                        return (
                                          a.electricity_bill +
                                          b.electricity_bill
                                        );
                                      }

                                      return 0;
                                    }) -
                                      Math.round(
                                        Object.values(
                                          bill_building_month[month]
                                        ).reduce((a, b) => a + b)
                                      ) >
                                    0
                                      ? "+"
                                      : ""}
                                    {numberFormatter.withCommas(
                                      parseFloat(
                                        ((lsTarget.reduce(function (a, b) {
                                          if (Number.isInteger(a)) {
                                            if (
                                              b.year === +year &&
                                              b.month === +month
                                            ) {
                                              return a + b.electricity_bill;
                                            }
                                            return a + 0;
                                          }

                                          if (
                                            b.year === +year &&
                                            b.month === +month &&
                                            a.year === +year &&
                                            a.month === +month
                                          ) {
                                            return (
                                              a.electricity_bill +
                                              b.electricity_bill
                                            );
                                          }

                                          return 0;
                                        }) -
                                          Math.round(
                                            Object.values(
                                              bill_building_month[month]
                                            ).reduce((a, b) => a + b)
                                          )) /
                                          lsTarget.reduce(function (a, b) {
                                            if (Number.isInteger(a)) {
                                              if (
                                                b.year === +year &&
                                                b.month === +month
                                              ) {
                                                return a + b.electricity_bill;
                                              }
                                              return a + 0;
                                            }

                                            if (
                                              b.year === +year &&
                                              b.month === +month &&
                                              a.year === +year &&
                                              a.month === +month
                                            ) {
                                              return (
                                                a.electricity_bill +
                                                b.electricity_bill
                                              );
                                            }

                                            return 0;
                                          })) *
                                          100
                                      ).toFixed(2)
                                    )}
                                    %
                                  </Text>
                                ) : (
                                  <Text style={styles.tableCellTotalRed}>
                                    -
                                  </Text>
                                )}
                              </View>
                            </View>
                          </View>
                        );
                      });
                    })}
                  </View>
                </View>
              </View>

              {monthDiff > 7 ? (
                <View style={styles.section}>
                  <View style={styles.table}>
                    <View style={styles.tableRow}>
                      <View style={styles.tableColHeader15}>
                        <Text style={styles.tableCellHeader}>
                          {t("Building")}
                        </Text>
                      </View>
                      {Object.keys(bill_building_month_year).map((year) => {
                        let bill_building_month =
                          bill_building_month_year[year];
                        if (count === 8) count = 0;

                        return Object.keys(bill_building_month).map((month) => {
                          if (count < 8) {
                            count++;
                            return;
                          }

                          if (count >= 10) return;
                          count++;

                          return (
                            <View style={styles.tableColHeader42_5}>
                              <View style={styles.tableRow}>
                                <View style={styles.tableColHeader}>
                                  <Text style={styles.tableCellHeaderRed}>
                                    {`${t(lsMonthFull[month])} ${
                                      i18n.language === "th"
                                        ? +year + 543
                                        : year
                                    }`}
                                  </Text>
                                </View>
                              </View>
                              <View style={styles.tableRow}>
                                <View style={styles.tableColHeader30}>
                                  <Text style={styles.tableCellHeader}>
                                    {t("Bill (Baht)")}
                                  </Text>
                                </View>
                                <View style={styles.tableColHeader30}>
                                  <Text style={styles.tableCellHeader}>
                                    {t("Target")}
                                  </Text>
                                </View>
                                <View style={styles.tableColHeader40}>
                                  <Text style={styles.tableCellHeader}>
                                    {t("% Target")}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          );
                        });
                      })}
                    </View>
                    {lsSelectedBuilding.map((bld) => (
                      <View style={styles.tableRow}>
                        <View style={styles.tableCol15}>
                          <Text style={styles.tableCellHeaderRed}>
                            {t(bld)}
                          </Text>
                        </View>

                        {Object.keys(bill_building_month_year).map((year) => {
                          let bill_building_month =
                            bill_building_month_year[year];
                          count = 0;

                          return Object.keys(bill_building_month).map(
                            (month) => {
                              if (count < 8) {
                                count++;
                                return;
                              }

                              if (count >= 10) return;
                              count++;

                              return (
                                <View style={styles.tableCol42_5}>
                                  <View style={styles.tableRow}>
                                    <View style={styles.tableCol30}>
                                      <Text style={styles.tableCellRed}>
                                        {numberFormatter.withCommas(
                                          Math.round(
                                            bill_building_month[month][bld]
                                          )
                                        )}
                                      </Text>
                                    </View>
                                    <View style={styles.tableCol30}>
                                      <Text style={styles.tableCellRed}>
                                        {lsTarget.find(
                                          (t) =>
                                            t.year === +year &&
                                            t.month === +month &&
                                            t.building === bld
                                        )
                                          ? lsTarget.find(
                                              (t) =>
                                                t.year === +year &&
                                                t.month === +month &&
                                                t.building === bld
                                            ).electricity_bill !== null
                                            ? numberFormatter.withCommas(
                                                lsTarget.find(
                                                  (t) =>
                                                    t.year === +year &&
                                                    t.month === +month &&
                                                    t.building === bld
                                                ).electricity_bill
                                              )
                                            : "-"
                                          : "-"}
                                      </Text>
                                    </View>
                                    <View style={styles.tableCol40}>
                                      {lsTarget.length > 0 ? (
                                        <Text style={styles.tableCellTotalRed}>
                                          {lsTarget.reduce(function (a, b) {
                                            if (Number.isInteger(a)) {
                                              if (
                                                b.year === +year &&
                                                b.month === +month
                                              ) {
                                                return a + b.electricity_bill;
                                              }
                                              return a + 0;
                                            }

                                            if (
                                              b.year === +year &&
                                              b.month === +month &&
                                              a.year === +year &&
                                              a.month === +month
                                            ) {
                                              return (
                                                a.electricity_bill +
                                                b.electricity_bill
                                              );
                                            }

                                            return 0;
                                          }) -
                                            Math.round(
                                              Object.values(
                                                bill_building_month[month]
                                              ).reduce((a, b) => a + b)
                                            ) >
                                          0
                                            ? "+"
                                            : ""}
                                          {numberFormatter.withCommas(
                                            parseFloat(
                                              ((lsTarget.reduce(function (
                                                a,
                                                b
                                              ) {
                                                if (Number.isInteger(a)) {
                                                  if (
                                                    b.year === +year &&
                                                    b.month === +month
                                                  ) {
                                                    return (
                                                      a + b.electricity_bill
                                                    );
                                                  }
                                                  return a + 0;
                                                }

                                                if (
                                                  b.year === +year &&
                                                  b.month === +month &&
                                                  a.year === +year &&
                                                  a.month === +month
                                                ) {
                                                  return (
                                                    a.electricity_bill +
                                                    b.electricity_bill
                                                  );
                                                }

                                                return 0;
                                              }) -
                                                Math.round(
                                                  Object.values(
                                                    bill_building_month[month]
                                                  ).reduce((a, b) => a + b)
                                                )) /
                                                lsTarget.reduce(function (
                                                  a,
                                                  b
                                                ) {
                                                  if (Number.isInteger(a)) {
                                                    if (
                                                      b.year === +year &&
                                                      b.month === +month
                                                    ) {
                                                      return (
                                                        a + b.electricity_bill
                                                      );
                                                    }
                                                    return a + 0;
                                                  }

                                                  if (
                                                    b.year === +year &&
                                                    b.month === +month &&
                                                    a.year === +year &&
                                                    a.month === +month
                                                  ) {
                                                    return (
                                                      a.electricity_bill +
                                                      b.electricity_bill
                                                    );
                                                  }

                                                  return 0;
                                                })) *
                                                100
                                            ).toFixed(2)
                                          )}
                                          %
                                        </Text>
                                      ) : (
                                        <Text style={styles.tableCellTotalRed}>
                                          -
                                        </Text>
                                      )}
                                    </View>
                                  </View>
                                </View>
                              );
                            }
                          );
                        })}
                      </View>
                    ))}
                    <View style={styles.tableRow}>
                      <View style={styles.tableCol15}>
                        <Text style={styles.tableCellTotal}>{t("Total")}</Text>
                      </View>
                      {Object.keys(bill_building_month_year).map((year) => {
                        let bill_building_month =
                          bill_building_month_year[year];
                        count = 0;

                        return Object.keys(bill_building_month).map((month) => {
                          if (count < 8) {
                            count++;
                            return;
                          }

                          if (count >= 10) return;
                          count++;

                          return (
                            <View style={styles.tableCol42_5}>
                              <View style={styles.tableRow}>
                                <View style={styles.tableCol30}>
                                  <Text style={styles.tableCellTotalRed}>
                                    {numberFormatter.withCommas(
                                      Math.round(
                                        Object.values(
                                          bill_building_month[month]
                                        ).reduce((a, b) => a + b)
                                      )
                                    )}
                                  </Text>
                                </View>
                                <View style={styles.tableCol30}>
                                  <Text style={styles.tableCellTotalRed}>
                                    {numberFormatter.withCommas(
                                      Math.round(
                                        lsTarget.length > 0
                                          ? lsTarget.reduce(function (a, b) {
                                              if (Number.isInteger(a)) {
                                                if (
                                                  b.year === +year &&
                                                  b.month === +month
                                                ) {
                                                  return a + b.electricity_bill;
                                                }
                                                return a + 0;
                                              }

                                              if (
                                                b.year === +year &&
                                                b.month === +month &&
                                                a.year === +year &&
                                                a.month === +month
                                              ) {
                                                return (
                                                  a.electricity_bill +
                                                  b.electricity_bill
                                                );
                                              }

                                              return 0;
                                            })
                                          : "-"
                                      )
                                    )}
                                  </Text>
                                </View>
                                <View style={styles.tableCol40}>
                                  {lsTarget.length > 0 ? (
                                    <Text style={styles.tableCellTotalRed}>
                                      {lsTarget.reduce(function (a, b) {
                                        if (Number.isInteger(a)) {
                                          if (
                                            b.year === +year &&
                                            b.month === +month
                                          ) {
                                            return a + b.electricity_bill;
                                          }
                                          return a + 0;
                                        }

                                        if (
                                          b.year === +year &&
                                          b.month === +month &&
                                          a.year === +year &&
                                          a.month === +month
                                        ) {
                                          return (
                                            a.electricity_bill +
                                            b.electricity_bill
                                          );
                                        }

                                        return 0;
                                      }) -
                                        Math.round(
                                          Object.values(
                                            bill_building_month[month]
                                          ).reduce((a, b) => a + b)
                                        ) >
                                      0
                                        ? "+"
                                        : ""}
                                      {numberFormatter.withCommas(
                                        parseFloat(
                                          ((lsTarget.reduce(function (a, b) {
                                            if (Number.isInteger(a)) {
                                              if (
                                                b.year === +year &&
                                                b.month === +month
                                              ) {
                                                return a + b.electricity_bill;
                                              }
                                              return a + 0;
                                            }

                                            if (
                                              b.year === +year &&
                                              b.month === +month &&
                                              a.year === +year &&
                                              a.month === +month
                                            ) {
                                              return (
                                                a.electricity_bill +
                                                b.electricity_bill
                                              );
                                            }

                                            return 0;
                                          }) -
                                            Math.round(
                                              Object.values(
                                                bill_building_month[month]
                                              ).reduce((a, b) => a + b)
                                            )) /
                                            lsTarget.reduce(function (a, b) {
                                              if (Number.isInteger(a)) {
                                                if (
                                                  b.year === +year &&
                                                  b.month === +month
                                                ) {
                                                  return a + b.electricity_bill;
                                                }
                                                return a + 0;
                                              }

                                              if (
                                                b.year === +year &&
                                                b.month === +month &&
                                                a.year === +year &&
                                                a.month === +month
                                              ) {
                                                return (
                                                  a.electricity_bill +
                                                  b.electricity_bill
                                                );
                                              }

                                              return 0;
                                            })) *
                                            100
                                        ).toFixed(2)
                                      )}
                                      %
                                    </Text>
                                  ) : (
                                    <Text style={styles.tableCellTotalRed}>
                                      -
                                    </Text>
                                  )}
                                </View>
                              </View>
                            </View>
                          );
                        });
                      })}
                    </View>
                  </View>
                </View>
              ) : (
                <Text></Text>
              )}
            </View>
          </Page>
        ) : (
          <Text></Text>
        )}

        {monthDiff > 9 ? (
          <Page size="A4" style={styles.page}>
            <View style={{ marginTop: 30 }} />
            <View style={styles.body}>
              <View style={styles.section}>
                <View style={styles.table}>
                  <View style={styles.tableRow}>
                    <View style={styles.tableColHeader15}>
                      <Text style={styles.tableCellHeader}>
                        {t("Building")}
                      </Text>
                    </View>
                    {Object.keys(bill_building_month_year).map((year) => {
                      let bill_building_month = bill_building_month_year[year];
                      if (count === 10) count = 0;

                      return Object.keys(bill_building_month).map((month) => {
                        if (count < 10) {
                          count++;
                          return;
                        }

                        if (count >= 12) return;
                        count++;

                        return (
                          <View style={styles.tableColHeader42_5}>
                            <View style={styles.tableRow}>
                              <View style={styles.tableColHeader}>
                                <Text style={styles.tableCellHeaderRed}>
                                  {`${t(lsMonthFull[month])} ${
                                    i18n.language === "th" ? +year + 543 : year
                                  }`}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.tableRow}>
                              <View style={styles.tableColHeader30}>
                                <Text style={styles.tableCellHeader}>
                                  {t("Bill (Baht)")}
                                </Text>
                              </View>
                              <View style={styles.tableColHeader30}>
                                <Text style={styles.tableCellHeader}>
                                  {t("Target")}
                                </Text>
                              </View>
                              <View style={styles.tableColHeader40}>
                                <Text style={styles.tableCellHeader}>
                                  {t("% Target")}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      });
                    })}
                  </View>
                  {lsSelectedBuilding.map((bld) => (
                    <View style={styles.tableRow}>
                      <View style={styles.tableCol15}>
                        <Text style={styles.tableCellHeaderRed}>{t(bld)}</Text>
                      </View>

                      {Object.keys(bill_building_month_year).map((year) => {
                        let bill_building_month =
                          bill_building_month_year[year];
                        count = 0;

                        return Object.keys(bill_building_month).map((month) => {
                          if (count < 10) {
                            count++;
                            return;
                          }

                          if (count >= 12) return;
                          count++;

                          return (
                            <View style={styles.tableCol42_5}>
                              <View style={styles.tableRow}>
                                <View style={styles.tableCol30}>
                                  <Text style={styles.tableCellRed}>
                                    {numberFormatter.withCommas(
                                      Math.round(
                                        bill_building_month[month][bld]
                                      )
                                    )}
                                  </Text>
                                </View>
                                <View style={styles.tableCol30}>
                                  <Text style={styles.tableCellRed}>
                                    {lsTarget.find(
                                      (t) =>
                                        t.year === +year &&
                                        t.month === +month &&
                                        t.building === bld
                                    )
                                      ? lsTarget.find(
                                          (t) =>
                                            t.year === +year &&
                                            t.month === +month &&
                                            t.building === bld
                                        ).electricity_bill !== null
                                        ? numberFormatter.withCommas(
                                            lsTarget.find(
                                              (t) =>
                                                t.year === +year &&
                                                t.month === +month &&
                                                t.building === bld
                                            ).electricity_bill
                                          )
                                        : "-"
                                      : "-"}
                                  </Text>
                                </View>
                                <View style={styles.tableCol40}>
                                  {lsTarget.length > 0 ? (
                                    <Text style={styles.tableCellTotalRed}>
                                      {lsTarget.reduce(function (a, b) {
                                        if (Number.isInteger(a)) {
                                          if (
                                            b.year === +year &&
                                            b.month === +month
                                          ) {
                                            return a + b.electricity_bill;
                                          }
                                          return a + 0;
                                        }

                                        if (
                                          b.year === +year &&
                                          b.month === +month &&
                                          a.year === +year &&
                                          a.month === +month
                                        ) {
                                          return (
                                            a.electricity_bill +
                                            b.electricity_bill
                                          );
                                        }

                                        return 0;
                                      }) -
                                        Math.round(
                                          Object.values(
                                            bill_building_month[month]
                                          ).reduce((a, b) => a + b)
                                        ) >
                                      0
                                        ? "+"
                                        : ""}
                                      {numberFormatter.withCommas(
                                        parseFloat(
                                          ((lsTarget.reduce(function (a, b) {
                                            if (Number.isInteger(a)) {
                                              if (
                                                b.year === +year &&
                                                b.month === +month
                                              ) {
                                                return a + b.electricity_bill;
                                              }
                                              return a + 0;
                                            }

                                            if (
                                              b.year === +year &&
                                              b.month === +month &&
                                              a.year === +year &&
                                              a.month === +month
                                            ) {
                                              return (
                                                a.electricity_bill +
                                                b.electricity_bill
                                              );
                                            }

                                            return 0;
                                          }) -
                                            Math.round(
                                              Object.values(
                                                bill_building_month[month]
                                              ).reduce((a, b) => a + b)
                                            )) /
                                            lsTarget.reduce(function (a, b) {
                                              if (Number.isInteger(a)) {
                                                if (
                                                  b.year === +year &&
                                                  b.month === +month
                                                ) {
                                                  return a + b.electricity_bill;
                                                }
                                                return a + 0;
                                              }

                                              if (
                                                b.year === +year &&
                                                b.month === +month &&
                                                a.year === +year &&
                                                a.month === +month
                                              ) {
                                                return (
                                                  a.electricity_bill +
                                                  b.electricity_bill
                                                );
                                              }

                                              return 0;
                                            })) *
                                            100
                                        ).toFixed(2)
                                      )}
                                      %
                                    </Text>
                                  ) : (
                                    <Text style={styles.tableCellTotalRed}>
                                      -
                                    </Text>
                                  )}
                                </View>
                              </View>
                            </View>
                          );
                        });
                      })}
                    </View>
                  ))}
                  <View style={styles.tableRow}>
                    <View style={styles.tableCol15}>
                      <Text style={styles.tableCellTotal}>{t("Total")}</Text>
                    </View>
                    {Object.keys(bill_building_month_year).map((year) => {
                      let bill_building_month = bill_building_month_year[year];
                      count = 0;

                      return Object.keys(bill_building_month).map((month) => {
                        if (count < 10) {
                          count++;
                          return;
                        }

                        if (count >= 12) return;
                        count++;

                        return (
                          <View style={styles.tableCol42_5}>
                            <View style={styles.tableRow}>
                              <View style={styles.tableCol30}>
                                <Text style={styles.tableCellTotalRed}>
                                  {numberFormatter.withCommas(
                                    Math.round(
                                      Object.values(
                                        bill_building_month[month]
                                      ).reduce((a, b) => a + b)
                                    )
                                  )}
                                </Text>
                              </View>
                              <View style={styles.tableCol30}>
                                <Text style={styles.tableCellTotalRed}>
                                  {numberFormatter.withCommas(
                                    Math.round(
                                      lsTarget.length > 0
                                        ? lsTarget.reduce(function (a, b) {
                                            if (Number.isInteger(a)) {
                                              if (
                                                b.year === +year &&
                                                b.month === +month
                                              ) {
                                                return a + b.electricity_bill;
                                              }
                                              return a + 0;
                                            }

                                            if (
                                              b.year === +year &&
                                              b.month === +month &&
                                              a.year === +year &&
                                              a.month === +month
                                            ) {
                                              return (
                                                a.electricity_bill +
                                                b.electricity_bill
                                              );
                                            }

                                            return 0;
                                          })
                                        : "-"
                                    )
                                  )}
                                </Text>
                              </View>
                              <View style={styles.tableCol40}>
                                {lsTarget.length > 0 ? (
                                  <Text style={styles.tableCellTotalRed}>
                                    {lsTarget.reduce(function (a, b) {
                                      if (Number.isInteger(a)) {
                                        if (
                                          b.year === +year &&
                                          b.month === +month
                                        ) {
                                          return a + b.electricity_bill;
                                        }
                                        return a + 0;
                                      }

                                      if (
                                        b.year === +year &&
                                        b.month === +month &&
                                        a.year === +year &&
                                        a.month === +month
                                      ) {
                                        return (
                                          a.electricity_bill +
                                          b.electricity_bill
                                        );
                                      }

                                      return 0;
                                    }) -
                                      Math.round(
                                        Object.values(
                                          bill_building_month[month]
                                        ).reduce((a, b) => a + b)
                                      ) >
                                    0
                                      ? "+"
                                      : ""}
                                    {numberFormatter.withCommas(
                                      parseFloat(
                                        ((lsTarget.reduce(function (a, b) {
                                          if (Number.isInteger(a)) {
                                            if (
                                              b.year === +year &&
                                              b.month === +month
                                            ) {
                                              return a + b.electricity_bill;
                                            }
                                            return a + 0;
                                          }

                                          if (
                                            b.year === +year &&
                                            b.month === +month &&
                                            a.year === +year &&
                                            a.month === +month
                                          ) {
                                            return (
                                              a.electricity_bill +
                                              b.electricity_bill
                                            );
                                          }

                                          return 0;
                                        }) -
                                          Math.round(
                                            Object.values(
                                              bill_building_month[month]
                                            ).reduce((a, b) => a + b)
                                          )) /
                                          lsTarget.reduce(function (a, b) {
                                            if (Number.isInteger(a)) {
                                              if (
                                                b.year === +year &&
                                                b.month === +month
                                              ) {
                                                return a + b.electricity_bill;
                                              }
                                              return a + 0;
                                            }

                                            if (
                                              b.year === +year &&
                                              b.month === +month &&
                                              a.year === +year &&
                                              a.month === +month
                                            ) {
                                              return (
                                                a.electricity_bill +
                                                b.electricity_bill
                                              );
                                            }

                                            return 0;
                                          })) *
                                          100
                                      ).toFixed(2)
                                    )}
                                    %
                                  </Text>
                                ) : (
                                  <Text style={styles.tableCellTotalRed}>
                                    -
                                  </Text>
                                )}
                              </View>
                            </View>
                          </View>
                        );
                      });
                    })}
                  </View>
                </View>
              </View>
            </View>
          </Page>
        ) : (
          <Text></Text>
        )}
      </Document>
    );
  }
}

export default withTranslation()(ElectricityBillReport);
