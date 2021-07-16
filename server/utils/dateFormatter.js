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

		if (ss < 10) {
			ss = "0" + ss;
		}

		return yyyy + "-" + mm + "-" + dd + " " + hh + ":" + min + ":" + ss;
	}
}

module.exports = { ddmmyyyy, ddmmyyyyhhmm, yyyymmddhhmmss };
