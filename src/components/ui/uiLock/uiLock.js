import css from "./uiLock.css";
css.install();

class UiLock extends HTMLElement {
	constructor(zIndex) {
		super();
		this.style.zIndex = zIndex;
		document.body.appendChild(this);
	}

	unlock() {
		this.addEventListener('animationend', () => {
			document.body.removeChild(this);
		});
		this.className = 'closing';
	}
}

customElements.define('x-uilock', UiLock);

export default UiLock;