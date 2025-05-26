import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { Chart } from 'chart.js/auto'; // Automatically registers controllers, elements, scales, plugins
import { allFormulas, ArmourFormula, generateSeriesData, SeriesData } from '../armour';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js';
import { use_local_storage } from '../hooks/storage';
import { SignalWatcher } from '@lit-labs/signals';

const DEFAULT_ARMOUR_STEPS_FOR_CHART = Array.from({ length: 31 }, (_, i) => i * 1000); // 0 to 30,000

@customElement('armour-chart')
export class ArmourChartElement extends SignalWatcher(LitElement) {
	@property({ type: Number })
	damageInput: number = 1000;

	@property({ type: Array })
	armourSteps: number[] = DEFAULT_ARMOUR_STEPS_FOR_CHART;

	#chartDataType = use_local_storage('chartDataType', 'total_damage');

	@query('canvas')
	private canvas!: HTMLCanvasElement;

	@state()
	private isAltPressed: boolean = false;

	private chartInstance: Chart | null = null;

	static styles = css`
		:host {
			display: flex; /* Use flexbox to manage child layout */
			flex-direction: column; /* Stack children vertically */
			width: 100%;
			max-width: 700px; /* Max width for readability, can be adjusted */
			height: 600px; /* Define a fixed height for the component */
			box-sizing: border-box; /* Include padding and border in the element's total width and height */
			padding: 1rem; /* Add some padding around the content */
		}
		canvas {
			width: 100% !important; /* Override potential inline styles from Chart.js if needed */
			flex-grow: 1; /* Make canvas take up all remaining vertical space */
			min-height: 0; /* Important for flexbox to allow canvas to shrink if needed */
		}
		.chart-type-toggle {
			margin-bottom: 1rem;
			display: flex;
			justify-content: center;
		}
	`;

	protected render(): TemplateResult {
		return html`
			<sl-radio-group
				label="Chart Data Type"
				value=${this.#chartDataType.get()}
				@sl-change=${this.handleChartDataTypeChange}
				class="chart-type-toggle"
				size="small"
			>
				<sl-radio-button value="total_damage">Damage Taken</sl-radio-button>
				<sl-radio-button value="reduction">Damage Reduction (%)</sl-radio-button>
			</sl-radio-group>
			<canvas></canvas>
		`;
	}

	private handleChartDataTypeChange(event: Event) {
		const radioGroup = event.target as HTMLInputElement;
		this.#chartDataType.set(radioGroup.value as 'reduction' | 'total_damage');
	}

	protected updated(): void {
		this.createOrUpdateChart();
	}

	connectedCallback(): void {
		super.connectedCallback();
		window.addEventListener('keydown', this.handleKeyDown);
		window.addEventListener('keyup', this.handleKeyUp);
	}

	disconnectedCallback(): void {
		super.disconnectedCallback();
		window.removeEventListener('keydown', this.handleKeyDown);
		window.removeEventListener('keyup', this.handleKeyUp);
		if (this.chartInstance) {
			this.chartInstance.destroy();
			this.chartInstance = null;
		}
	}

	private handleKeyDown = (event: KeyboardEvent): void => {
		if (event.key === 'Alt' && !this.isAltPressed) {
			this.isAltPressed = true;
			this.updateConditionalSeriesVisibility();
		}
	};

	private handleKeyUp = (event: KeyboardEvent): void => {
		if (event.key === 'Alt') {
			this.isAltPressed = false;
			this.updateConditionalSeriesVisibility();
		}
	};

	private updateConditionalSeriesVisibility(): void {
		if (!this.chartInstance || !this.chartInstance.data.datasets) {
			return;
		}
		this.chartInstance.data.datasets.forEach((dataset, index) => {
			const formula = allFormulas[index]; // Assumes dataset order matches allFormulas order
			if (formula?.conditionalDisplay) {
				dataset.hidden = !this.isAltPressed;
			}
		});
		this.chartInstance.update();
	}

	private createOrUpdateChart(): void {
		if (!this.canvas) {
			return;
		}

		if (this.chartInstance) {
			this.chartInstance.destroy();
		}

		const allSeriesData: { formula: ArmourFormula; series: SeriesData }[] = allFormulas.map(formula => ({
			formula,
			series: generateSeriesData(formula, this.damageInput, this.armourSteps, this.#chartDataType.get()),
		}));

		const chartJsDatasets = allSeriesData.map(({ formula, series }, index) => {
			const colors = [
				'rgb(75, 192, 192)',
				'rgb(255, 99, 132)',
				'rgb(54, 162, 235)',
				'rgb(255, 159, 64)',
				'rgb(153, 102, 255)',
			];
			return {
				label: series.name,
				data: series.points.map(p => p.value),
				borderColor: colors[index % colors.length],
				tension: 0.1,
				fill: false,
				// Set initial visibility based on conditionalDisplay flag and current Alt key state
				hidden: formula.conditionalDisplay ? !this.isAltPressed : false,
			};
		});

		const yAxisTitle = this.#chartDataType.get() === 'reduction' ? 'Damage Reduction (%)' : 'Damage Taken';
		const chartTitle = `Armour Effectiveness vs ${this.damageInput} Damage Hit`;
		const currentChartDataType = this.#chartDataType.get(); // Capture for use in callbacks

		this.chartInstance = new Chart(this.canvas, {
			type: 'line',
			data: {
				labels: this.armourSteps.map(String),
				datasets: chartJsDatasets,
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					title: {
						display: true,
						text: chartTitle,
						font: { size: 18 },
						padding: { bottom: 20 },
					},
					legend: {
						position: 'top',
						labels: {
							// Only show legend items that are not hidden
							filter: function (item, _chart) {
								return !item.hidden;
							},
						},
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						callbacks: {
							label: function (context) {
								let label = context.dataset.label || '';
								if (label) label += ': ';
								if (context.parsed.y !== null) {
									label +=
										context.parsed.y.toFixed(2) + (currentChartDataType === 'reduction' ? '%' : '');
								}
								return label;
							},
						},
					},
				},
				scales: {
					x: { title: { display: true, text: 'Armour' } },
					y: {
						title: { display: true, text: yAxisTitle },
						beginAtZero: true,
						max: currentChartDataType === 'reduction' ? 100 : undefined,
					},
				},
			},
		});
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'armour-chart': ArmourChartElement;
	}
}
