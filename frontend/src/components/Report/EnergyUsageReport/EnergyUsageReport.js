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
import http from "../../../utils/http";

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
	date: { color: "red", fontSize: 10, marginBottom: 3, fontWeight: "bold" },
	logo: { width: 90 },

	body: {
		display: "flex",
		flexDirection: "column",
		marginLeft: 30,
		marginRight: 30,
		marginBottom: 10,
	},
	section: {
		marginBottom: 10,
	},
	line: {
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
	},
	red: { color: "red" },
});

class EnergyUsageReport extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			dateFrom: this.props.dateFrom,
			dateTo: this.props.dateTo,
			lsSelectedBuilding: this.props.lsSelectedBuilding,
			lsBuilding: this.props.lsBuilding,
			kwh_system_building: {},
			kwhSolar: 0,
		};

		this.getData = this.getData.bind(this);
		this.getDataSolar = this.getDataSolar.bind(this);
	}

	async componentDidMount() {
		await this.getData();
		await this.getDataSolar();
	}

	async getData() {
		try {
			let { lsBuilding, lsSelectedBuilding, dateFrom, dateTo } = this.state;

			let lsBuildingID = [];
			for (let bld of lsBuilding) {
				if (lsSelectedBuilding.includes(bld.label)) lsBuildingID.push(bld.id);
			}

			let payload = {
				ls_building_id: lsBuildingID,
				date_from: dateFrom,
				date_to: dateTo,
			};

			let resp = await http.post("/building/energy/datetime", payload);

			this.setState({
				kwh_system_building: resp.data,
			});
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	async getDataSolar() {
		try {
			let { dateFrom, dateTo } = this.state;

			let payload = {
				start: dateFrom,
				end: dateTo,
			};

			let resp = await http.post("/api/solar/datetime", payload);

			console.log(resp.data);
		} catch (err) {
			console.log(err);
			return err.response;
		}
	}

	render() {
		let {
			dateFrom,
			dateTo,
			lsSelectedBuilding,
			lsBuilding,
			kwh_system_building,
		} = this.state;

		const { t } = this.props;

		let kwhMainTotal = 0;
		let kwhAcTotal = 0;

		for (let [kwh_system, building] of Object.entries(kwh_system_building)) {
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
									{t("Building") + ": "}
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
								<Text>{t("System")}: </Text>
								<Text style={styles.red}>{t("All")}</Text>
							</View>
						</View>

						<View style={styles.section}>
							<View style={styles.line}>
								<Text>{t(`NIDA's energy usage from`)}</Text>
								<Text style={styles.red}>
									{dateFormatter.ddmmyyyyhhmm_noOffset(dateFrom) + " "}
								</Text>
								<Text>{t("to")} </Text>
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
										</Text>
									)}
								</Text>
								<Text>{" " + t("with total energy usage of") + " "}</Text>
							</View>
						</View>
					</View>
				</Page>
			</Document>
		);
	}
}

export default withTranslation()(EnergyUsageReport);
