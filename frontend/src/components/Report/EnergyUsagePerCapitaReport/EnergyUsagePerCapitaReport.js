import React from "react";

import {
	Document,
	Page,
	View,
	Text,
	Image,
	StyleSheet,
	Font,
} from "@react-pdf/renderer";

import dateFormatter from "../../../utils/dateFormatter";
import numberFormatter from "../../../utils/numberFormatter";

import { withTranslation } from "react-i18next";

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
	lineCenter: {
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "center",
	},
	red: { color: "red" },

	barChart: {
		height: 150,
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
	tableColHeader25: {
		width: "25%",
		borderStyle: "solid",
		borderColor: "#000",
		borderWidth: 0.5,
		borderRightWidth: 1.5,
		borderTopWidth: 1.5,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	tableColHeader35: {
		width: "35%",
		borderStyle: "solid",
		borderColor: "#000",
		borderWidth: 0.5,
		borderRightWidth: 1.5,
		borderTopWidth: 1.5,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	tableCol15: {
		width: "15%",
		borderStyle: "solid",
		borderColor: "#000",
		borderWidth: 0.5,
		borderLeftWidth: 1.5,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	tableCol25: {
		width: "25%",
		borderStyle: "solid",
		borderColor: "#000",
		borderWidth: 0.5,
		borderRightWidth: 1.5,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	tableCol35: {
		width: "35%",
		borderStyle: "solid",
		borderColor: "#000",
		borderWidth: 0.5,
		borderRightWidth: 1.5,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	tableCellHeader: {
		fontSize: 16,
		fontWeight: 600,
	},
	tableCellRed: {
		fontSize: 16,
		fontWeight: 600,
		color: "red",
	},
});

class EnergyUsagePerCapitaReport extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			dateFrom: this.props.dateFrom,
			dateTo: this.props.dateTo,
			lsSelectedBuilding: this.props.lsSelectedBuilding,
			lsBuilding: this.props.lsBuilding,
			kwh_system_building: this.props.kwh_system_building,
			lsTarget: this.props.lsTarget,
			b64BarChartBuildingEnergyUsage: this.props.b64BarChartBuildingEnergyUsage,
			b64BarChartBuildingEnergyUsagePerCapita:
				this.props.b64BarChartBuildingEnergyUsagePerCapita,
		};
	}

	render() {
		let {
			dateFrom,
			dateTo,
			lsSelectedBuilding,
			lsBuilding,
			kwh_system_building,
			lsTarget,
			b64BarChartBuildingEnergyUsage,
			b64BarChartBuildingEnergyUsagePerCapita,
		} = this.state;

		const { t } = this.props;

		let kwhMainTotal = 0;
		for (let kwh_system of Object.values(kwh_system_building)) {
			kwhMainTotal += kwh_system["Main"];
		}

		let capitaTotal = 0;
		for (let target of lsTarget) {
			if (target.amount_people !== null) capitaTotal += target.amount_people;
		}

		return (
			<Document>
				<Page size="A4" style={styles.page}>
					<View style={styles.header}>
						<Text style={styles.title}>
							{t("Energy Usage per Capita Report")}
						</Text>
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
						</View>

						<View style={styles.section}>
							<View style={styles.line}>
								<Text>{t("NIDA's energy usage per capita from") + " "}</Text>
								<Text style={styles.red}>
									{dateFormatter.ddmmyyyyhhmm_noOffset(dateFrom) + " "}
								</Text>
								<Text>{t("to") + " "}</Text>
								<Text style={styles.red}>
									{dateFormatter.ddmmyyyyhhmm_noOffset(dateTo)}
								</Text>
							</View>

							<View style={styles.line}>
								<Text>{t("of building")} </Text>
								{lsSelectedBuilding.length === lsBuilding.length ? (
									<Text style={styles.red}>{t("All")} </Text>
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
							</View>

							<View style={styles.line}>
								<Text>{t("has a total energy usage of")} </Text>
								<Text style={styles.red}>
									{numberFormatter.withCommas(
										parseFloat(kwhMainTotal).toFixed(2)
									) + " "}
								</Text>
								<Text>{t("kWh")}</Text>
							</View>

							<View style={styles.line}>
								<Text>{t("has a total capita of")} </Text>
								<Text style={styles.red}>
									{numberFormatter.withCommas(
										parseFloat(capitaTotal).toFixed(2)
									) + " "}
								</Text>
								<Text>{t("people")}</Text>
							</View>

							<View style={styles.line}>
								<Text>{t("has an energy usage per capita of")} </Text>
								<Text style={styles.red}>
									{numberFormatter.withCommas(
										parseFloat(kwhMainTotal / capitaTotal).toFixed(2)
									) + " "}
								</Text>
								<Text>{t("kWh")}</Text>
							</View>
						</View>

						<View style={styles.section}>
							<View style={styles.lineCenter}>
								<Text>{`${t("Energy Usage")} (${t("kWh")})`}</Text>
							</View>
							<View style={styles.lineCenter}>
								<View>
									<Image
										style={styles.barChart}
										src={b64BarChartBuildingEnergyUsage}
									/>
								</View>
							</View>
						</View>

						<View style={styles.section}>
							<View style={styles.lineCenter}>
								<Text>{`${t("Energy Usage per Capita")} (${t("kWh")})`}</Text>
							</View>
							<View style={styles.lineCenter}>
								<View>
									<Image
										style={styles.barChart}
										src={b64BarChartBuildingEnergyUsagePerCapita}
									/>
								</View>
							</View>
						</View>

						{lsSelectedBuilding.length <= 5 ? (
							<View style={styles.table}>
								<View style={styles.tableRow}>
									<View style={styles.tableColHeader15}>
										<Text style={styles.tableCellHeader}>{t("Building")}</Text>
									</View>
									<View style={styles.tableColHeader25}>
										<Text>{`${t("Capita")} (${t("people")})`}</Text>
									</View>
									<View style={styles.tableColHeader25}>
										<Text>{`${t("report2.Energy Usage")} (${t("kWh")})`}</Text>
									</View>
									<View style={styles.tableColHeader35}>
										<Text>{`${t("Energy Usage per Capita")} (${t(
											"kWh"
										)})`}</Text>
									</View>
								</View>
								{lsSelectedBuilding.map((bld) => {
									let capita = "-";

									let kwh = "-";
									if (kwh_system_building[bld] !== undefined) {
										kwh = kwh_system_building[bld]["Main"];
									}

									let kwhPerCapita = "-";

									let target = lsTarget.find((t) => t.building === bld);
									if (target) {
										if (target.amount_people !== null) {
											capita = target.amount_people;

											if (capita !== 0) {
												kwhPerCapita = numberFormatter.withCommas(
													parseFloat(kwh / capita).toFixed(2)
												);
											}
										}
									}

									return (
										<View style={styles.tableRow}>
											<View style={styles.tableCol15}>
												<Text style={styles.tableCellRed}>{t(bld)}</Text>
											</View>
											<View style={styles.tableCol25}>
												<Text style={styles.tableCellRed}>{capita}</Text>
											</View>
											<View style={styles.tableCol25}>
												<Text style={styles.tableCellRed}>
													{numberFormatter.withCommas(
														parseFloat(kwh).toFixed(2)
													)}
												</Text>
											</View>
											<View style={styles.tableCol35}>
												<Text style={styles.tableCellRed}>{kwhPerCapita}</Text>
											</View>
										</View>
									);
								})}
							</View>
						) : (
							<Text></Text>
						)}
					</View>
				</Page>

				{lsSelectedBuilding.length > 5 ? (
					<Page size="A4" style={styles.page}>
						<View style={{ marginTop: 30 }} />
						<View style={styles.body}>
							<View style={styles.table}>
								<View style={styles.tableRow}>
									<View style={styles.tableColHeader15}>
										<Text style={styles.tableCellHeader}>{t("Building")}</Text>
									</View>
									<View style={styles.tableColHeader25}>
										<Text>{`${t("Capita")} (${t("people")})`}</Text>
									</View>
									<View style={styles.tableColHeader25}>
										<Text>{`${t("report2.Energy Usage")} (${t("kWh")})`}</Text>
									</View>
									<View style={styles.tableColHeader35}>
										<Text>{`${t("Energy Usage per Capita")} (${t(
											"kWh"
										)})`}</Text>
									</View>
								</View>
								{lsSelectedBuilding.map((bld) => {
									let capita = "-";

									let kwh = "-";
									if (kwh_system_building[bld] !== undefined) {
										kwh = kwh_system_building[bld]["Main"];
									}

									let kwhPerCapita = "-";

									let target = lsTarget.find((t) => t.building === bld);
									if (target) {
										if (target.amount_people !== null) {
											capita = target.amount_people;

											if (capita !== 0) {
												kwhPerCapita = numberFormatter.withCommas(
													parseFloat(kwh / capita).toFixed(2)
												);
											}
										}
									}

									return (
										<View style={styles.tableRow}>
											<View style={styles.tableCol15}>
												<Text style={styles.tableCellRed}>{t(bld)}</Text>
											</View>
											<View style={styles.tableCol25}>
												<Text style={styles.tableCellRed}>{capita}</Text>
											</View>
											<View style={styles.tableCol25}>
												<Text style={styles.tableCellRed}>
													{numberFormatter.withCommas(
														parseFloat(kwh).toFixed(2)
													)}
												</Text>
											</View>
											<View style={styles.tableCol35}>
												<Text style={styles.tableCellRed}>{kwhPerCapita}</Text>
											</View>
										</View>
									);
								})}
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

export default withTranslation()(EnergyUsagePerCapitaReport);
