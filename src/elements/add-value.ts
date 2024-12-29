import { signal, SignalWatcher } from '@lit-labs/signals';
import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/input/input.js';
import { Size } from '../size';

@customElement('add-value')
export class AddInputElement extends SignalWatcher(LitElement) {
	#input_value = signal('');

	@property({ reflect: true }) size: Size = 'medium';
	@property({ reflect: true }) label: string = 'Add';
	@property({ type: Number, reflect: true }) value: number = 0;
	@property({ type: Object }) on_add_value?: (value: number) => void;

	protected render(): TemplateResult {
		return html`<div>
			<form @submit=${this.#on_submit}>
				<sl-input
					size=${this.size}
					autocomplete="off"
					@input=${this.#update_input_value}
					.value=${this.#input_value.get()}
				></sl-input>
				<sl-button type="submit" size=${this.size} .disabled=${!this.#input_value.get()}
					>${this.label}</sl-button
				>
			</form>
		</div>`;
	}

	#update_input_value(e: Event) {
		this.#input_value.set((e.target as HTMLInputElement).value);
	}

	#on_submit(e: SubmitEvent) {
		e.preventDefault();
		const value = Number(this.#input_value.get().trim());
		if (!value) {
			return;
		}

		this.dispatchEvent(new AddValueEvent(value));
		console.log('here');
		this.#input_value.set('');
	}

	static styles = css`
		form {
			display: flex;
			gap: 1rem;
		}

		sl-input {
			width: 10ch;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'add-value': AddInputElement;
	}
}

declare global {
	interface HTMLElementEventMap {
		'add-value__add': AddValueEvent;
	}
}
export class AddValueEvent extends Event {
	value: number;
	static readonly tag = 'add-value__add';

	constructor(value: number, options?: EventInit) {
		super(AddValueEvent.tag, options);
		this.value = value;
	}
}
