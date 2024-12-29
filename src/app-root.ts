import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement } from 'lit/decorators.js';
import './elements/armour-table';
import { SignalWatcher } from '@lit-labs/signals';
import { RemoveEvent } from './elements/armour-table';
import { damages } from './stores/damages';
import { armours } from './stores/armours';
import './elements/add-value';
import { AddValueEvent } from './elements/add-value';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/alert/alert.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';

@customElement('app-root')
export class AppRootElement extends SignalWatcher(LitElement) {
	protected render(): TemplateResult {
		return html`
			<header id="header">
				<h1>Path of Exile 2 Armour</h1>
				<div class="icons">
					<a target="_blank" href="https://github.com/shonya3/poe2-armour">
						<sl-icon name="github"></sl-icon>
					</a>
				</div>
			</header>
			<div id="tables">
				${damages.value
					.get()
					.map(
						dmg =>
							html`<armour-table
								.armours=${armours.value.get()}
								@armour-table__remove=${this.#h_remove_table}
								damage=${dmg}
							></armour-table>`
					)}
			</div>

			<div id="controls">
				<div class="add">
					<add-value @add-value__add=${this.#h_add_damage} label="Add damage table"></add-value>
					<add-value label="Add armour row" @add-value__add=${this.#h_add_armour_row}></add-value>
				</div>
				<sl-button
					.disabled=${armours.is_default() && damages.is_default()}
					size="small"
					@click=${this.to_defaults}
					>to defaults</sl-button
				>
			</div>

			<div id="tip">
				<sl-alert variant="primary" open>
					<sl-icon slot="icon" name="info-circle"></sl-icon>
					Press Alt to compare with PoE 1
				</sl-alert>
			</div>
			<section id="links">
				<h2>Links</h2>
				<ul>
					<li>
						<a
							target="_blank"
							href="https://www.reddit.com/r/pathofexile/comments/1hln20p/poe_2_armor_formula_testing_and_estimates/?rdt=39147"
							>Reddit POE 2 armor formula testing and estimates</a
						>
					</li>

					<li>
						<a target="_blank" href="https://www.poe2wiki.net/wiki/Armour#Rule_of_thumb"
							>Poe 2 Wiki Armour</a
						>
					</li>

					<li>
						<a target="_blank" href="https://www.poewiki.net/wiki/Armour#Rule_of_thumb">Poe Wiki Armour</a>
					</li>
				</ul>
			</section>
		`;
	}

	to_defaults() {
		damages.to_default();
		armours.to_default();
	}

	#h_add_armour_row(e: AddValueEvent) {
		armours.add(e.value);
	}

	#h_add_damage(e: AddValueEvent) {
		damages.add(e.value);
	}

	#h_remove_table(e: RemoveEvent) {
		damages.remove(e.value);
	}

	static styles = css`
		#header {
			padding-block: 1rem;
			padding-left: 1rem;
			display: flex;
			justify-content: space-between;
		}

		#controls {
			padding-top: 1rem;
			display: flex;
			flex-wrap: wrap;
			flex-direction: column;
			gap: 1rem;

			@media (width > 450px) {
				flex-direction: row;
				justify-content: space-between;
				align-items: center;
				max-width: 1300px;
			}
		}

		.add {
			padding: 1rem;
			padding-top: 1rem;
			display: flex;
			flex-wrap: wrap;
			flex-direction: column;
			gap: 1rem;

			@media (width > 600px) {
				flex-direction: row;
				align-items: center;
				gap: 8rem;
			}
		}

		#tables {
			padding-inline: 1rem;
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			gap: 60px;

			@media (width > 600px) {
				justify-content: initial;
			}
		}

		#tip {
			padding: 3rem;
			max-width: 400px;
		}

		.icons {
			display: flex;
			align-items: center;
			gap: 0rem;
			padding-right: 0.5rem;

			@media (width > 500px) {
				padding-right: 4rem;
			}

			sl-icon {
				font-size: 1.5rem;

				a {
					all: unset;
				}
			}
		}

		#links {
			padding: 1rem;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'app-root': AppRootElement;
	}
}
