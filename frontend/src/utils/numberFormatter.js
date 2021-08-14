function withCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const numberFormatter = {
	withCommas,
};

export default numberFormatter;
