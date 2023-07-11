ace.define("ace/ext/searchbox", function(require, exports) {
	"use strict";

	let dom = require("../lib/dom");
	let lang = require("../lib/lang");
	let event = require("../lib/event");
	let HashHandler = require("../keyboard/hash_handler").HashHandler;
	let keyUtil = require("../lib/keys");

	let MAX_COUNT = 999;

	let SearchBox = function(editor) {	// (editor, range, showReplaceForm)
		let div = dom.createElement("div");
		dom.buildDom(["div", {class:"ace_search right"},
			["i", {action: "hide", class: "ico delete actionHover ace_searchbtn_close"}],
			["div", {class: "ace_search_form"},
				["input", {class: "ace_search_field", placeholder: "Search for", spellcheck: "false"}],
				["span", {action: "toggleCaseSensitive", class: "ace_button", title: "CaseSensitive Search"}, "Aa"],
				["span", {action: "toggleWholeWords", class: "ace_button", title: "Whole Word Search"}, "W"],
				["span", {action: "toggleRegexpMode", class: "ace_button", title: "RegExp Search"}, ".*"],
				["span", {action: "searchInSelection", class: "ace_button", title: "Search In Selection"}, "S"],

				["span", {class: "ace_search_counter"}],

				["i", {action: "findPrev", class: "ico arrowUp prev"}, ""],
				["i", {action: "findNext", class: "ico arrowDown next"}, ""],

				["button", {action: "findAll", class: "ace_searchbtn", title: "Alt-Enter"}, "All"],
			],
			["div", {class: "ace_replace_form"},
				["input", {class: "ace_search_field", placeholder: "Replace with", spellcheck: "false"}],
				["button", {action: "replaceAndFindNext", class: "ace_searchbtn"}, "Replace"],
				["button", {action: "replaceAll", class: "ace_searchbtn"}, "Replace All"]
			]
		], div);
		this.element = div.firstChild;

		this.setSession = this.setSession.bind(this);

		this.$init();
		this.setEditor(editor);
	};

	(function() {
		this.setEditor = function(editor) {
			editor.searchBox = this;
			editor.renderer.container.parentNode.insertBefore(this.element, editor.renderer.container);
			this.editor = editor;
			editor.resize();
		};

		this.setSession = function() {
			this.searchRange = null;
			this.$syncOptions(true);
		};

		this.$initElements = function(sb) {
			this.searchBox = sb.querySelector(".ace_search_form");
			this.replaceBox = sb.querySelector(".ace_replace_form");
			this.searchOption = sb.querySelector("[action=searchInSelection]");
			this.regExpOption = sb.querySelector("[action=toggleRegexpMode]");
			this.caseSensitiveOption = sb.querySelector("[action=toggleCaseSensitive]");
			this.wholeWordOption = sb.querySelector("[action=toggleWholeWords]");
			this.searchInput = this.searchBox.querySelector(".ace_search_field");
			this.replaceInput = this.replaceBox.querySelector(".ace_search_field");
			this.searchCounter = sb.querySelector(".ace_search_counter");
			this.replaceOption = {};
		};

		this.$init = function() {
			let sb = this.element;

			this.$initElements(sb);

			let _this = this;
			event.addListener(sb, "mousedown", function(e) {
				setTimeout(function(){
					_this.activeInput.focus();
				}, 0);
				event.stopPropagation(e);
			});
			event.addListener(sb, "click", function(e) {
				let t = e.target;
				let action = t.getAttribute("action");
				if (action && _this[action])
					_this[action]();
				else if (_this.$searchBarKb.commands[action])
					_this.$searchBarKb.commands[action].exec(_this);
				event.stopPropagation(e);
			});

			event.addCommandKeyListener(sb, function(e, hashId, keyCode) {
				let keyString = keyUtil.keyCodeToString(keyCode);
				let command = _this.$searchBarKb.findKeyCommand(hashId, keyString);
				if (command && command.exec) {
					command.exec(_this);
					event.stopEvent(e);
				}
			});

			this.$onChange = lang.delayedCall(function() {
				_this.find(false, false);
			});

			event.addListener(this.searchInput, "input", function() {
				_this.$onChange.schedule(20);
			});
			event.addListener(this.searchInput, "focus", function() {
				_this.activeInput = _this.searchInput;
				_this.searchInput.value && _this.highlight();
			});
			event.addListener(this.replaceInput, "focus", function() {
				_this.activeInput = _this.replaceInput;
				_this.searchInput.value && _this.highlight();
			});
		};

		//keybinding outside of the searchbox
		this.$closeSearchBarKb = new HashHandler([{
			bindKey: "Esc",
			name: "closeSearchBar",
			exec: function(editor) {
				editor.searchBox.hide();
			}
		}]);

		//keybinding outside of the searchbox
		this.$searchBarKb = new HashHandler();
		this.$searchBarKb.bindKeys({
			"Ctrl-f|Command-f": function(sb) {
				let isReplace = sb.isReplace = !sb.isReplace;
				sb.replaceBox.style.display = isReplace ? "" : "none";
				sb.replaceOption.checked = false;
				sb.$syncOptions();
				sb.searchInput.focus();
			},
			"Ctrl-H|Command-Option-F": function(sb) {
				console.log(sb);
				if (sb.editor.getReadOnly())
					return;
				sb.replaceOption.checked = true;
				sb.$syncOptions();
				sb.replaceInput.focus();
			},
			"Ctrl-G|Command-G": function(sb) {
				sb.findNext();
			},
			"Ctrl-Shift-G|Command-Shift-G": function(sb) {
				sb.findPrev();
			},
			"esc": function(sb) {
				setTimeout(function() { sb.hide();});
			},
			"Return": function(sb) {
				if (sb.activeInput === sb.replaceInput)
					sb.replace();
				sb.findNext();
			},
			"Shift-Return": function(sb) {
				if (sb.activeInput === sb.replaceInput)
					sb.replace();
				sb.findPrev();
			},
			"Alt-Return": function(sb) {
				if (sb.activeInput === sb.replaceInput)
					sb.replaceAll();
				sb.findAll();
			},
			"Tab": function(sb) {
				(sb.activeInput === sb.replaceInput ? sb.searchInput : sb.replaceInput).focus();
			}
		});

		this.$searchBarKb.addCommands([{
			name: "toggleRegexpMode",
			bindKey: {win: "Alt-R|Alt-/", mac: "Ctrl-Alt-R|Ctrl-Alt-/"},
			exec: function(sb) {
				sb.regExpOption.checked = !sb.regExpOption.checked;
				sb.$syncOptions();
			}
		}, {
			name: "toggleCaseSensitive",
			bindKey: {win: "Alt-C|Alt-I", mac: "Ctrl-Alt-R|Ctrl-Alt-I"},
			exec: function(sb) {
				sb.caseSensitiveOption.checked = !sb.caseSensitiveOption.checked;
				sb.$syncOptions();
			}
		}, {
			name: "toggleWholeWords",
			bindKey: {win: "Alt-B|Alt-W", mac: "Ctrl-Alt-B|Ctrl-Alt-W"},
			exec: function(sb) {
				sb.wholeWordOption.checked = !sb.wholeWordOption.checked;
				sb.$syncOptions();
			}
		}, {
			name: "toggleReplace",
			exec: function(sb) {
				sb.replaceOption.checked = !sb.replaceOption.checked;
				sb.$syncOptions();
			}
		}, {
			name: "searchInSelection",
			exec: function(sb) {
				sb.searchOption.checked = !sb.searchRange;
				sb.setSearchRange(sb.searchOption.checked && sb.editor.getSelectionRange());
				sb.$syncOptions();
			}
		}]);

		this.setSearchRange = function(range) {
			this.searchRange = range;
			if (range) {
				this.searchRangeMarker = this.editor.session.addMarker(range, "ace_active-line");
			} else if (this.searchRangeMarker) {
				this.editor.session.removeMarker(this.searchRangeMarker);
				this.searchRangeMarker = null;
			}
		};

		this.$syncOptions = function(preventScroll) {
			dom.setCssClass(this.searchOption, "checked", this.searchOption.checked);
			dom.setCssClass(this.regExpOption, "checked", this.regExpOption.checked);
			dom.setCssClass(this.wholeWordOption, "checked", this.wholeWordOption.checked);
			dom.setCssClass(this.caseSensitiveOption, "checked", this.caseSensitiveOption.checked);
			let readOnly = this.editor.getReadOnly();
			this.replaceBox.style.display = this.replaceOption.checked && !readOnly ? "" : "none";
			this.find(false, false, preventScroll);
		};

		this.highlight = function(re) {
			this.editor.session.highlight(re || this.editor.$search.$options.re);
			this.editor.renderer.updateBackMarkers();
		};
		this.find = function(skipCurrent, backwards, preventScroll) {
			let range = this.editor.find(this.searchInput.value, {
				skipCurrent: skipCurrent,
				backwards: backwards,
				wrap: true,
				regExp: this.regExpOption.checked,
				caseSensitive: this.caseSensitiveOption.checked,
				wholeWord: this.wholeWordOption.checked,
				preventScroll: preventScroll,
				range: this.searchRange
			});
			let noMatch = !range && this.searchInput.value;
			dom.setCssClass(this.searchBox, "ace_nomatch", noMatch);
			this.editor._emit("findSearchBox", { match: !noMatch });
			this.highlight();
			this.updateCounter();
		};
		this.updateCounter = function() {
			let editor = this.editor;
			let regex = editor.$search.$options.re;
			let all = 0;
			let before = 0;
			if (regex) {
				let value = this.searchRange
					? editor.session.getTextRange(this.searchRange)
					: editor.getValue();

				let offset = editor.session.doc.positionToIndex(editor.selection.anchor);
				if (this.searchRange)
					offset -= editor.session.doc.positionToIndex(this.searchRange.start);

				let last = regex.lastIndex = 0;
				let m;
				while ((m = regex.exec(value))) {
					all++;
					last = m.index;
					if (last <= offset)
						before++;
					if (all > MAX_COUNT)
						break;
					if (!m[0]) {
						regex.lastIndex = last += 1;
						if (last >= value.length)
							break;
					}
				}
			}
			this.searchCounter.textContent = before + " of " + (all > MAX_COUNT ? MAX_COUNT + "+" : all);
			if (all === 0) {
				this.searchBox.classList.add("empty");
				this.replaceBox.classList.add("empty");
			} else {
				this.searchBox.classList.remove("empty");
				this.replaceBox.classList.remove("empty");
			}
		};
		this.findNext = function() {
			this.find(true, false);
		};
		this.findPrev = function() {
			this.find(true, true);
		};
		this.findAll = function(){
			let range = this.editor.findAll(this.searchInput.value, {
				regExp: this.regExpOption.checked,
				caseSensitive: this.caseSensitiveOption.checked,
				wholeWord: this.wholeWordOption.checked
			});
			let noMatch = !range && this.searchInput.value;
			dom.setCssClass(this.searchBox, "ace_nomatch", noMatch);
			this.editor._emit("findSearchBox", { match: !noMatch });
			this.highlight();
			this.hide();
		};
		this.replace = function() {
			if (!this.editor.getReadOnly())
				this.editor.replace(this.replaceInput.value);
		};
		this.replaceAndFindNext = function() {
			if (!this.editor.getReadOnly()) {
				this.editor.replace(this.replaceInput.value);
				this.findNext();
			}
		};
		this.replaceAll = function() {
			if (!this.editor.getReadOnly())
				this.editor.replaceAll(this.replaceInput.value);
		};

		this.hide = function() {
			this.active = false;
			this.setSearchRange(null);
			this.editor.off("changeSession", this.setSession);

			this.element.style.display = "none";
			this.editor.keyBinding.removeKeyboardHandler(this.$closeSearchBarKb);
			this.editor.focus();
		};
		this.show = function(value, isReplace) {
			this.active = true;
			this.editor.on("changeSession", this.setSession);
			this.element.style.display = "";
			this.replaceOption.checked = isReplace;

			if (value)
				this.searchInput.value = value;

			this.searchInput.focus();
			this.searchInput.select();

			this.editor.keyBinding.addKeyboardHandler(this.$closeSearchBarKb);

			this.$syncOptions(true);
		};

		this.isFocused = function() {
			let el = document.activeElement;
			return el === this.searchInput || el === this.replaceInput;
		};
	}).call(SearchBox.prototype);

	exports.SearchBox = SearchBox;

	exports.Search = function(editor, isReplace) {
		let sb = editor.searchBox || new SearchBox(editor);
		sb.show(editor.session.getTextRange(), isReplace);
	};

});


(function () {
	ace.require(["ace/ext/searchbox"], function (m) {
		if (typeof module == "object" && typeof exports == "object" && module) {
			module.exports = m;
		}
	});
})();