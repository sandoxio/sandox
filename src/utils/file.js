/**
 * @description downloadFile
 * @returns {(function(*, *): void)|*}
 */

const a = document.createElement("a");
document.body.appendChild(a);
a.style.display = "none";

const file = {
	download: (data, fileName) => {
		if (!(data instanceof Blob)) {
			data = new Blob([data], {type: "octet/stream"});
		}
		const url = window.URL.createObjectURL(data);
		a.href = url;
		a.download = fileName;
		a.click();
		window.URL.revokeObjectURL(url);
	}
}

export default file;