let lsMonth = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

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

		return dd + "/" + mm + "/" + yyyy;
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

		return dd + "/" + mm + "/" + yyyy + " " + hh + ":" + min;
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

		return yyyy + "-" + mm + "-" + dd + " " + hh + ":" + min + ":" + ss;
	}
}

function ddmmmyyyy(date) {
	if (date instanceof Date) {
		const offset = date.getTimezoneOffset();
		date = new Date(date.getTime() - offset * 60 * 1000);

		let dd = date.getDate();
		let mmm = lsMonth[date.getMonth()].substring(0, 3);
		let yyyy = date.getFullYear();

		return dd + " " + mmm + " " + yyyy;
	}
}

function toDateTimeString(date) {
	if (date instanceof Date) {
		const offset = date.getTimezoneOffset();
		date = new Date(date.getTime() - offset * 60 * 1000);

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

		return dd + "/" + mm + "/" + yyyy + " " + hh + ":" + min;
	}
}

function ddmmmyyyyhhmm_noOffset(date) {
	if (date instanceof Date) {
		let dd = date.getDate();
		let mmm = lsMonth[date.getMonth()].substring(0, 3);
		let yyyy = date.getFullYear();
		let hh = date.getHours();
		let min = date.getMinutes();

		if (dd < 10) {
			dd = "0" + dd;
		}

		if (hh < 10) {
			hh = "0" + hh;
		}

		if (min < 10) {
			min = "0" + min;
		}

		return dd + " " + mmm + " " + yyyy + " " + hh + ":" + min;
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

		return yyyy + "-" + mm + "-" + dd + " " + hh + ":" + min + ":" + ss;
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

		return yyyy + "-" + mm + "-" + dd;
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

		return yyyy + "-" + mm + "-" + dd;
	}
}

const dateFormatter = {
	ddmmyyyy,
	ddmmyyyyhhmm,
	yyyymmddhhmmss,
	ddmmmyyyy,
	toDateTimeString,
	ddmmyyyyhhmm_noOffset,
	ddmmmyyyyhhmm_noOffset,
	yyyymmddhhmmss_noOffset,
	yyyymmdd_noOffset,
	yyyymmdd_input,
};

export default dateFormatter;
