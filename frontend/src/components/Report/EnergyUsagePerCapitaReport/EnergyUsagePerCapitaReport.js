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
					</View>
				</Page>
			</Document>
		);
	}
}

export default withTranslation()(EnergyUsagePerCapitaReport);
