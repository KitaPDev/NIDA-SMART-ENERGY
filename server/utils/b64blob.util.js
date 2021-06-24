let Blob = require("node-blob");

function b64toBlob(data, contentType = "") {
	let byteString = data;
	let ab = new ArrayBuffer(byteString.length);
	let ia = new Uint8Array(ab);

	for (let i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}
	return new Blob([ab], { type: contentType });
}

module.exports = { b64toBlob };
