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

export default { ddmmyyyy };
