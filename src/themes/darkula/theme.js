import button from "./css/button.css";
import html from "./css/html.css";
import input from "./css/input.css";
import table from "./css/table.css";
import link from "./css/link.css";
import scrollbar from "./css/scrollbar.css";
import select from "./css/select.css";
import text from "./css/text.css";
import vars from "./css/vars.css";
import ico from "./css/ico.css";
import icoImages from "./css/icoImages.css";

const css = {
	install: () => {
		button.install();
		html.install();
		input.install();
		table.install();
		link.install();
		scrollbar.install();
		select.install();
		text.install();
		vars.install();
		ico.install();
		icoImages.install();
	}
};

export default css;