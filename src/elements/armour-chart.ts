import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { Chart } from 'chart.js/auto'; // Automatically registers controllers, elements, scales, plugins
import { allFormulas, ArmourFormula, generateSeriesData, SeriesData } from '../armour';

const DEFAULT_ARMOUR_STEPS_FOR_CHART = Array.from({ length: 31 }, (_, i) => i * 1000); // 0 to 30,000

@customElement('armour-chart')
export class ArmourChartElement extends LitElement {
	@property({ type: Number })
	damageInput: number = 1000;

	@property({ type: Array })
	armourSteps: number[] = DEFAULT_ARMOUR_STEPS_FOR_CHART;

	// For this chart, we'll focus on 'reduction'. Could be a prop if more flexibility is needed.
	private chartDataType: 'reduction' | 'total_damage' = 'total_damage';

	@query('canvas')
	private canvas!: HTMLCanvasElement;

	@state()
	private isAltPressed: boolean = false;

	private chartInstance: Chart | null = null;

	static styles = css`
		:host {
			display: block;
			width: 100%;
			max-width: 700px; /* Max width for readability, can be adjusted */
			padding: 1rem;
			box-sizing: border-box;
			/* Ensure the host has some dimensions for the canvas to relate to */
			position: relative; /* Important for child canvas sizing */
			min-height: 300px; /* Or any other sensible minimum height */
		}
		canvas {
			width: 100% !important; /* Override potential inline styles from Chart.js if needed */
			height: 100% !important; /* Make canvas fill the host's height */
		}
	`;

	protected render(): TemplateResult {
		return html`<canvas></canvas>`;
	}

	protected firstUpdated(): void {
		this.createOrUpdateChart();
	}

	protected updated(changedProperties: Map<string | number | symbol, unknown>): void {
		if ((changedProperties.has('damageInput') || changedProperties.has('armourSteps')) && this.canvas) {
			this.createOrUpdateChart();
		}
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
			series: generateSeriesData(formula, this.damageInput, this.armourSteps, this.chartDataType),
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

		const yAxisTitle = this.chartDataType === 'reduction' ? 'Damage Reduction (%)' : 'Damage Taken';
		const chartTitle = `Armour Effectiveness vs ${this.damageInput} Damage Hit`;
		const currentChartDataType = this.chartDataType; // Capture for use in callbacks

		this.chartInstance = new Chart(this.canvas, {
			type: 'line',
			data: {
				labels: this.armourSteps.map(String),
				datasets: chartJsDatasets,
			},
			options: {
				responsive: true,
				maintainAspectRatio: true,
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
