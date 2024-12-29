import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, query } from 'lit/decorators.js';
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
	@query('#damage_input') damage_input!: HTMLInputElement;

	protected render(): TemplateResult {
		return html`
			<header id="header">
				<h1>Path of Exile 2 Armour</h1>
				<div id="controls">
					<add-value @add-value__add=${this.#h_add_damage} label="Add damage table"></add-value>
					<add-value label="Add armour row" @add-value__add=${this.#h_add_armour_row}></add-value>
					<sl-button size="small" @click=${this.to_defaults}>to defaults</sl-button>
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
		}

		#controls {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		#tables {
			padding-top: 1rem;
			padding-inline: 1rem;
			display: flex;
			flex-wrap: wrap;
			gap: 60px;
		}

		#tip {
			padding: 3rem;
			max-width: 400px;
		}
	`;
}

declare global {
	interface HTMLElementTagNameMap {
		'app-root': AppRootElement;
	}
}
