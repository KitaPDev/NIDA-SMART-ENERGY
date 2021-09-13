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
	tableColHeader85: {
		width: "85%",
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
	tableCol85: {
		width: "85%",
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

	lineChart: {
		width: "50%",
		padding: 10,
	},
});

class AcPowerCompareTempHumiReport extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			dateFrom: this.props.dateFrom,
			dateTo: this.props.dateTo,
			lsSelectedBuilding: this.props.lsSelectedBuilding,
			lsBuilding: this.props.lsBuilding,
			b64LineChartTempKw_building: this.props.b64LineChartTempKw_building,
			b64LineChartHumiKw_building: this.props.b64LineChartHumiKw_building,
		};
	}

	render() {
		let {
			dateFrom,
			dateTo,
			lsSelectedBuilding,
			lsBuilding,
			b64LineChartTempKw_building,
			b64LineChartHumiKw_building,
		} = this.state;

		const { t } = this.props;

		return (
			<Document>
				<Page size="A4" style={styles.page}>
					<View style={styles.header}>
						<Text style={styles.title}>
							{t("A/C Power Used Compared to Temperature and Humidity Report")}
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
								<Text>
									{t(
										"Compare air conditioning power usage to temperature and humidity."
									)}
								</Text>
							</View>

							<View style={styles.table}>
								<View style={styles.tableRow}>
									<View style={styles.tableColHeader15}>
										<Text style={styles.tableCellHeader}>{t("Building")}</Text>
									</View>
									<View style={styles.tableColHeader85}>
										<View style={styles.line}>
											<Svg width="10" height="10" style={{ marginRight: 5 }}>
												<Rect width="10" height="10" fill="#FFC708" />
											</Svg>
											<Text style={{ fontSize: 16, marginRight: 20 }}>
												{t("Power") + " (kW)"}
											</Text>

											<Svg width="10" height="10" style={{ marginRight: 5 }}>
												<Rect width="10" height="10" fill="#C0DDFB" />
											</Svg>
											<Text style={{ fontSize: 16, marginRight: 20 }}>
												{t("Humidity") + " (%)"}
											</Text>

											<Svg width="10" height="10" style={{ marginRight: 5 }}>
												<Rect width="10" height="10" fill="#FF0859" />
											</Svg>
											<Text style={{ fontSize: 16, marginRight: 20 }}>
												{t("Temperature") + " (°C)"}
											</Text>
										</View>
									</View>
								</View>

								{lsSelectedBuilding.map((bld) => (
									<View style={styles.tableRow}>
										<View style={styles.tableCol15}>
											<Text style={styles.tableCellRed}>{t(bld)}</Text>
										</View>
										<View style={styles.tableCol85}>
											<View style={styles.line}>
												<Image
													style={styles.lineChart}
													src={b64LineChartHumiKw_building[bld]}
												/>
												<Image
													style={styles.lineChart}
													src={b64LineChartTempKw_building[bld]}
												/>
											</View>
										</View>
									</View>
								))}
							</View>
						</View>
					</View>
				</Page>
			</Document>
		);
	}
}

export default withTranslation()(AcPowerCompareTempHumiReport);
