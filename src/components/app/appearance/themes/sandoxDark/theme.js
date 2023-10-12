import button from "../common/css/button.css";
import html from "../common/css/html.css";
import input from "../common/css/input.css";
import table from "../common/css/table.css";
import link from "../common/css/link.css";
import scrollbar from "../common/css/scrollbar.css";
import select from "../common/css/select.css";
import text from "../common/css/text.css";
import ico from "../common/css/ico.css";
import icoImages from "../common/css/icoImages.css";

import vars from "./css/vars.css";

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
	},
	remove: () => {
		button.remove();
		html.remove();
		input.remove();
		table.remove();
		link.remove();
		scrollbar.remove();
		select.remove();
		text.remove();
		vars.remove();
		ico.remove();
		icoImages.remove();
	}
};

export default css;