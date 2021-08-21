function exportFile(fileName, dataRows) {
	let csvContent =
		"data:text/csv;charset=utf-8," +
		dataRows.map((e) => e.join(",")).join("\n");

	let encodedUri = encodeURI(csvContent);
	let link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", `${fileName}.csv`);
	document.body.appendChild(link); // Required for FF

	link.click(); // This will download the data file named "my_data.csv".
}

const csv = {
	exportFile,
};

export default csv;
