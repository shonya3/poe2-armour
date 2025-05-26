export interface ArmourFormula {
	name: string;
	reduction: (params: { armour: number; damage: number }) => number;
	total_damage: (params: { armour: number; damage: number }) => number;
	conditionalDisplay?: boolean; // True if this formula should only be shown on demand (e.g., Alt key press)
}

export const poe2: ArmourFormula = {
	name: 'PoE 2 (Current)',
	reduction({ armour, damage }: { armour: number; damage: number }): number {
		return armour / (armour + 10 * damage);
	},
	total_damage({ armour, damage }: { armour: number; damage: number }) {
		const reduction_value = this.reduction({ armour, damage });
		return damage * (1 - reduction_value);
	},
};

export const poe2_010: ArmourFormula = {
	name: 'PoE 2 (0.1.0)',
	reduction({ armour, damage }: { armour: number; damage: number }): number {
		return armour / (armour + 12 * damage);
	},
	conditionalDisplay: true,
	total_damage({ armour, damage }: { armour: number; damage: number }) {
		const reduction_value = this.reduction({ armour, damage });
		return damage * (1 - reduction_value);
	},
};

export const poe1: ArmourFormula = {
	name: 'PoE 1',
	reduction({ armour, damage }: { armour: number; damage: number }): number {
		return armour / (armour + 5 * damage);
	},
	conditionalDisplay: true,
	total_damage({ armour, damage }: { armour: number; damage: number }) {
		const reduction_value = this.reduction({ armour, damage });
		return damage * (1 - reduction_value);
	},
};

export const allFormulas: ArmourFormula[] = [poe2, poe2_010, poe1];

export type ChartPoint = {
	armour: number; // Typically the x-value
	value: number; // The calculated y-value (e.g., reduction % or damage taken)
};

export type SeriesData = {
	name: string;
	points: ChartPoint[];
};

/**
 * Generates a series of data points for a given armour formula,
 * suitable for plotting on a chart.
 *
 * @param formula - The armour formula to use (e.g., poe1, poe2).
 * @param damageInput - The amount of incoming damage for the calculation.
 * @param armourValues - An array of armour values to calculate for (e.g., [0, 1000, 2000, ...]).
 * @param dataType - Which value to calculate: 'reduction' (as a percentage) or 'total_damage'.
 * @returns An array of {armour, value} objects.
 */
export function generateSeriesData(
	formula: ArmourFormula,
	damageInput: number,
	armourValues: number[],
	dataType: 'reduction' | 'total_damage'
): SeriesData {
	const points = armourValues.map(armour => {
		const value =
			dataType === 'reduction'
				? formula.reduction({ armour, damage: damageInput }) * 100 // as percentage
				: formula.total_damage({ armour, damage: damageInput });
		return { armour, value };
	});
	return { name: formula.name, points };
}
