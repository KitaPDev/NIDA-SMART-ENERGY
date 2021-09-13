import { lsMonthFull } from "./months";
import i18n from "../i18n";

function ddmmyyyy(date) {
	if (date instanceof Date) {
		const offset = date.getTimezoneOffset();
		date = new Date(date.getTime() - offset * 60 * 1000);

		let dd = date.getDate();
		let mm = date.getMonth() + 1;
		let yyyy = date.getFullYear();

		if (dd < 10) {
			dd = "0" + dd;
		}

		if (mm < 10) {
			mm = "0" + mm;
		}

		return dd + "/" + mm + "/" + (i18n.language === "th" ? yyyy + 543 : yyyy);
	}
}

function ddmmyyyy_noOffset(date) {
	if (date instanceof Date) {
		let dd = date.getDate();
		let mm = date.getMonth() + 1;
		let yyyy = date.getFullYear();

		if (dd < 10) {
			dd = "0" + dd;
		}

		if (mm < 10) {
			mm = "0" + mm;
		}

		return dd + "/" + mm + "/" + (i18n.language === "th" ? yyyy + 543 : yyyy);
	}
}

function ddmmyyyyhhmm(date) {
	if (date instanceof Date) {
		const offset = date.getTimezoneOffset();
		date = new Date(date.getTime() - offset * 60 * 1000);

		let dd = date.getDate();
		let mm = date.getMonth() + 1;
		let yyyy = date.getFullYear();
		let hh = date.getHours();
		let min = date.getMinutes();

		if (dd < 10) {
			dd = "0" + dd;
		}

		if (mm < 10) {
			mm = "0" + mm;
		}

		if (hh < 10) {
			hh = "0" + hh;
		}

		if (min < 10) {
			min = "0" + min;
		}

		return (
			dd +
			"/" +
			mm +
			"/" +
			(i18n.language === "th" ? yyyy + 543 : yyyy) +
			" " +
			(hh === "24" ? "00" : hh) +
			":" +
			min
		);
	}
}

function yyyymmddhhmmss(date) {
	if (date instanceof Date) {
		const offset = date.getTimezoneOffset();
		date = new Date(date.getTime() - offset * 60 * 1000);

		let dd = date.getDate();
		let mm = date.getMonth() + 1;
		let yyyy = date.getFullYear();
		let hh = date.getHours();
		let min = date.getMinutes();
		let ss = date.getSeconds();

		if (dd < 10) {
			dd = "0" + dd;
		}

		if (mm < 10) {
			mm = "0" + mm;
		}

		if (hh < 10) {
			hh = "0" + hh;
		}

		if (min < 10) {
			min = "0" + min;
		}

		if (ss < 10) {
			ss = "0" + ss;
		}

		return (
			(i18n.language === "th" ? yyyy + 543 : yyyy) +
			"-" +
			mm +
			"-" +
			dd +
			" " +
			(hh === "24" ? "00" : hh) +
			":" +
			min +
			":" +
			ss
		);
	}
}

function ddmmmyyyy(date) {
	if (date instanceof Date) {
		const offset = date.getTimezoneOffset();
		date = new Date(date.getTime() - offset * 60 * 1000);

		let dd = date.getDate();
		let mmm = i18n.t(lsMonthFull[date.getMonth()]);
		let yyyy = date.getFullYear();

		return dd + " " + mmm + " " + (i18n.language === "th" ? yyyy + 543 : yyyy);
	}
}

function toDateTimeString(date) {
	if (date instanceof Date) {
		const offset = date.getTimezoneOffset();
		date = new Date(date.getTime() - offset * 60 * 1000);

		return date.toISOString().substring(0, 16);
	}
}

function toDateTimeString_noOffset(date) {
	if (date instanceof Date) {
		return date.toISOString().substring(0, 16);
	}
}

function ddmmyyyyhhmm_noOffset(date) {
	if (date instanceof Date) {
		let dd = date.getDate();
		let mm = date.getMonth() + 1;
		let yyyy = date.getFullYear();
		let hh = date.getHours();
		let min = date.getMinutes();

		if (dd < 10) {
			dd = "0" + dd;
		}

		if (mm < 10) {
			mm = "0" + mm;
		}

		if (hh < 10) {
			hh = "0" + hh;
		}

		if (min < 10) {
			min = "0" + min;
		}

		return (
			dd +
			"/" +
			mm +
			"/" +
			(i18n.language === "th" ? yyyy + 543 : yyyy) +
			" " +
			(hh === "24" ? "00" : hh) +
			":" +
			min
		);
	}
}

function ddmmmyyyyhhmm_noOffset(date) {
	if (date instanceof Date) {
		let dd = date.getDate();
		let mmm = i18n.t(lsMonthFull[date.getMonth()]);
		let yyyy = date.getFullYear();
		let hh = date.getHours();
		let min = date.getMinutes();

		if (hh < 10) {
			hh = "0" + hh;
		}

		if (min < 10) {
			min = "0" + min;
		}

		return (
			dd +
			" " +
			mmm +
			" " +
			(i18n.language === "th" ? yyyy + 543 : yyyy) +
			", " +
			(hh === "24" ? "00" : hh) +
			":" +
			min
		);
	}
}

function yyyymmddhhmmss_noOffset(date) {
	if (date instanceof Date) {
		let dd = date.getDate();
		let mm = date.getMonth() + 1;
		let yyyy = date.getFullYear();
		let hh = date.getHours();
		let min = date.getMinutes();
		let ss = date.getSeconds();

		if (dd < 10) {
			dd = "0" + dd;
		}

		if (mm < 10) {
			mm = "0" + mm;
		}

		if (hh < 10) {
			hh = "0" + hh;
		}

		if (min < 10) {
			min = "0" + min;
		}

		if (ss < 10) {
			ss = "0" + ss;
		}

		return (
			(i18n.language === "th" ? yyyy + 543 : yyyy) +
			"-" +
			mm +
			"-" +
			dd +
			" " +
			(hh === "24" ? "00" : hh) +
			":" +
			min +
			":" +
			ss
		);
	}
}

function yyyymmdd_noOffset(date) {
	if (date instanceof Date) {
		let dd = date.getDate();
		let mm = date.getMonth() + 1;
		let yyyy = date.getFullYear();

		if (dd < 10) {
			dd = "0" + dd;
		}

		if (mm < 10) {
			mm = "0" + mm;
		}

		return (i18n.language === "th" ? yyyy + 543 : yyyy) + "-" + mm + "-" + dd;
	}
}

function yyyymmdd_input(date) {
	if (date instanceof Date) {
		let dd = date.getDate();
		let mm = date.getMonth() + 1;
		let yyyy = date.getFullYear();

		if (dd < 10) {
			dd = "0" + dd;
		}

		if (mm < 10) {
			mm = "0" + mm;
		}

		return (i18n.language === "th" ? yyyy + 543 : yyyy) + "-" + mm + "-" + dd;
	}
}

function hhmm(date) {
	if (date instanceof Date) {
		let hh = date.getHours();
		let min = date.getMinutes();

		if (hh < 10) {
			hh = "0" + hh;
		}

		if (min < 10) {
			min = "0" + min;
		}

		return (hh === "24" ? "00" : hh) + ":" + min;
	}
}

const dateFormatter = {
	ddmmyyyy,
	ddmmyyyy_noOffset,
	ddmmyyyyhhmm,
	yyyymmddhhmmss,
	ddmmmyyyy,
	toDateTimeString,
	toDateTimeString_noOffset,
	ddmmyyyyhhmm_noOffset,
	ddmmmyyyyhhmm_noOffset,
	yyyymmddhhmmss_noOffset,
	yyyymmdd_noOffset,
	yyyymmdd_input,
	hhmm,
};

export default dateFormatter;
