import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { fmt } from '../fmt';
import { poe1, poe2 } from '../armour';
import './add-value';
import { armours } from '../stores/armours';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import { signal, SignalWatcher } from '@lit-labs/signals';

@customElement('armour-table')
export class ArmourTableElement extends SignalWatcher(LitElement) {
	#is_alt_key_active = signal(false);

	@property({ type: Number, reflect: true }) damage = 0;
	@property({ type: Array }) armours: Array<number> = [0, 2000, 3000, 6500, 10000];

	#on_alt_pressed = (e: KeyboardEvent) => {
		if (e.key === 'Alt') {
			e.preventDefault();
			this.#is_alt_key_active.set(true);
		}
	};
	#on_alt_released = () => {
		this.#is_alt_key_active.set(false);
	};

	connectedCallback(): void {
		super.connectedCallback();
		window.addEventListener('keydown', this.#on_alt_pressed);
		window.addEventListener('keyup', this.#on_alt_released);
	}
	disconnectedCallback(): void {
		super.disconnectedCallback();
		window.removeEventListener('keydown', this.#on_alt_pressed);
		window.removeEventListener('keyup', this.#on_alt_released);
	}

	protected render(): TemplateResult {
		return html`<table>
				<caption>
					${this.damage}
				</caption>
				<thead>
					<th>Armour</th>
					<th>Damage</th>
					<th>Reduction</th>
					${this.#is_alt_key_active.get() ? html`<th colspan="2">PoE 1</th>` : null}
				</thead>
				<tbody>
					${this.armours
						.map(armour => ({
							armour,
							poe2: {
								reduction: poe2.reduction({ armour, damage: this.damage }),
								damage: poe2.total_damage({ armour, damage: this.damage }),
							},
							poe1: {
								reduction: poe1.reduction({ armour, damage: this.damage }),
								damage: poe1.total_damage({ armour, damage: this.damage }),
							},
						}))
						.map(
							({ armour, poe2, poe1 }) =>
								html`<tr>
									<td>${armour}</td>
									<td class="damage">${fmt(poe2.damage)}</td>
									<td class="reduction">${fmt_reduction(poe2.reduction)}</td>
									${this.#is_alt_key_active.get()
										? html`<td class="poe1 damage">${fmt(poe1.damage)}</td>
												<td class="poe1 reduction">${fmt_reduction(poe1.reduction)}</td>`
										: null}
									${armour === 0
										? null
										: html`<td>
												<sl-button size="small" @click=${() => armours.remove(armour)}
													>Remove</sl-button
												>
										  </td>`}
								</tr>`
						)}
				</tbody>
			</table>
			<sl-button @click=${this.#emit_remove} id="remove">Remove</sl-button>`;
	}

	#emit_remove() {
		this.dispatchEvent(new RemoveEvent(this.damage));
	}

	static styles = css`
		:host {
			padding: 1rem;
			display: block;
			background-color: #f0f9ff;
			border-radius: 6px;
			position: relative;
		}

		td,
		th {
			padding: 0.4rem 0.8rem;
		}

		td {
			color: #3f3f46;
			vertical-align: middle;
		}

		caption {
			font-size: 28px;
			padding: 0.4rem;
			font-weight: 600;
			color: ##020617;
		}

		td.damage {
			color: #030712;
		}

		td.reduction {
			color: #059669;
			font-size: 20px;
		}

		#remove {
			position: absolute;
			top: 1rem;
			right: 1rem;
		}

		.poe1 {
			background-color: #e7e5e4;
		}
	`;
}

function fmt_reduction(value: number) {
	if (!value) {
		return null;
	}

	return `-${fmt(value * 100)}%`;
}

declare global {
	interface HTMLElementEventMap {
		'armour-table__remove': RemoveEvent;
	}
}
export class RemoveEvent extends Event {
	static readonly tag = 'armour-table__remove';
	value: number;

	constructor(value: number, options?: EventInit) {
		super(RemoveEvent.tag, options);
		this.value = value;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'armour-table': ArmourTableElement;
	}
}
