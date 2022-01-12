import { ItemView, MarkdownView, Plugin, WorkspaceLeaf } from 'obsidian';
import { UNICODE_TO_ASCII, VIEW_TYPE_PUNCTUATION } from './constants';

// Remember to rename these classes and interfaces!

export default class JustThePunctuation extends Plugin {
	punctuationView: PunctuationView;

	async onload() {
		console.log("Loading Punctuation plugin")

		this.addCommand({
			id: 'app:show-punctuation',
			name: 'Show just the punctuation for this note',
			callback: () => this.initLeaf()
		});

		this.registerView(
			VIEW_TYPE_PUNCTUATION,
			(leaf: WorkspaceLeaf) =>
				(this.punctuationView = new PunctuationView(leaf))
		);

		this.registerInterval(
			window.setInterval(async () => {
				this.punctuationView && this.updateView()
			}, 2000)
		);
	}

	initLeaf() {
		if (this.app.workspace.getLeavesOfType(VIEW_TYPE_PUNCTUATION).length > 0) {
			return;
		}

		this.app.workspace.getRightLeaf(true).setViewState({
			type: VIEW_TYPE_PUNCTUATION,
			active: true
		});

		this.app.workspace.revealLeaf(
      this.app.workspace.getLeavesOfType(VIEW_TYPE_PUNCTUATION)[0]
    );
	}

	updateView() {
		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		this.punctuationView.update(markdownView.contentEl);
	}

	onunload() {
		console.log("Unloading Punctuation plugin");
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_PUNCTUATION);
	}
}

class PunctuationView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return VIEW_TYPE_PUNCTUATION;
	}

	getDisplayText(): string {
		return 'Just the Punctuation';
	}

	getIcon() {
		return 'info';
	}

	async onOpen() {
		console.log("ON OPEN")
		const container = this.containerEl.children[1];
		const contentEl = this.contentEl;
		if (!contentEl.hasClass('punctuation-panel')) {
			contentEl.addClass('punctuation-panel');
		}
    container.empty();
		contentEl.innerText = '...'
	}

	update(source: HTMLElement) {
		const punctuation = this.punctuationFrom(source.innerText);
		const display = punctuation.map(c => String.fromCharCode(c)).join(' ');

		const contentEl = this.contentEl;
		contentEl.setText(display);
	}

	punctuationFrom(text: string) {
		const nonPunctuation = / |\w|[\r\n]|\d/g
		const punctuation = text.replace(nonPunctuation, '');

		const punctuationArray = [];
		for (let c = 0; c < punctuation.length; c++) {
			const charCode = punctuation.charCodeAt(c)
			if (charCode < 128) {
				punctuationArray.push(charCode);
			} else {
				if (UNICODE_TO_ASCII.get(charCode)) {
					punctuationArray.push(UNICODE_TO_ASCII.get(charCode));
				}
			}
		}

		return punctuationArray
	}
}
