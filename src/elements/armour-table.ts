import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { fmt } from '../fmt';
import { poe1, poe2, poe2_010 } from '../armour';
import './add-value';
import { armours } from '../stores/armours';
import '../elements/armour-chart';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import { signal, SignalWatcher } from '@lit-labs/signals';
import { Mode } from '../mode';

@customElement('armour-table')
export class ArmourTableElement extends SignalWatcher(LitElement) {
	#is_alt_key_active = signal(false);
	#is_chart_dialog_open = signal(false);

	@property({ reflect: true }) mode: Mode = 'idle';
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
		return html`
			<div class="table-header">
				<div class="caption-content">
					${this.damage}
					${this.damage === 1100 ? html`<span id="monkey-slam-note">(a3 monkey slam)</span>` : null}
				</div>
				<sl-button variant="default" size="small" @click=${() => this.#is_chart_dialog_open.set(true)}>
					<sl-icon name="bar-chart-line" slot="prefix"></sl-icon>Show Chart
				</sl-button>
			</div>

			<table>
				<thead>
					<th>Armour</th>
					<th>Damage</th>
					<th>Reduction</th>
					${this.#is_alt_key_active.get() ? html`<th colspan="2">PoE 2 pre buff</th>` : null}
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
							poe2_010: {
								reduction: poe2_010.reduction({ armour, damage: this.damage }),
								damage: poe2_010.total_damage({ armour, damage: this.damage }),
							},
							poe1: {
								reduction: poe1.reduction({ armour, damage: this.damage }),
								damage: poe1.total_damage({ armour, damage: this.damage }),
							},
						}))
						.map(
							({ armour, poe2, poe2_010, poe1 }) =>
								html`<tr>
									<td>${armour}</td>
									<td class="damage">${fmt(poe2.damage)}</td>
									<td class="reduction">${fmt_reduction(poe2.reduction)}</td>
									${this.#is_alt_key_active.get()
										? html`<td class="poe1 damage">${fmt(poe2_010.damage)}</td>
												<td class="poe1 reduction">${fmt_reduction(poe2_010.reduction)}</td>`
										: null}
									${this.#is_alt_key_active.get()
										? html`<td class="poe1 damage">${fmt(poe1.damage)}</td>
												<td class="poe1 reduction">${fmt_reduction(poe1.reduction)}</td>`
										: null}
									${armour === 0 || this.mode !== 'edit'
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
			${this.mode === 'edit' ? html`<sl-button @click=${this.#emit_remove} id="remove">Remove</sl-button>` : null}

			<sl-dialog
				label="Armour Effectiveness Chart for ${this.damage} Damage"
				class="chart-dialog"
				.open=${this.#is_chart_dialog_open.get()}
				@sl-after-hide=${() => this.#is_chart_dialog_open.set(false)}
			>
				${this.#is_chart_dialog_open.get()
					? html`<armour-chart .damageInput=${this.damage} .armourSteps=${this.armours}></armour-chart>`
					: null}
			</sl-dialog>
		`;
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

		.table-header {
			display: flex;
			align-items: center;
			gap: 1rem;
			padding: 0.4rem 0; /* Adjust padding as needed */
			margin-bottom: 0.5rem;
		}

		.caption-content {
			font-size: 28px;
			font-weight: 500; /* Adjusted from 600 for consistency if desired */
			color: #020617; /* Ensure color is valid, was ##020617 */
		}
		td,
		th {
			padding: 0.4rem 0.8rem;
		}

		td {
			color: #3f3f46;
			vertical-align: middle;
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

		#monkey-slam-note {
			font-size: 16px;
		}

		.chart-dialog::part(panel) {
			width: 90vw;
			max-width: 800px;
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
