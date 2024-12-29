export const poe2 = {
	reduction({ armour, damage }: { armour: number; damage: number }): number {
		return armour / (armour + 12 * damage);
	},
	total_damage({ armour, damage }: { armour: number; damage: number }) {
		return damage - damage * this.reduction({ armour, damage });
	},
};

export const poe1 = {
	reduction({ armour, damage }: { armour: number; damage: number }): number {
		return armour / (armour + 5 * damage);
	},
	total_damage({ armour, damage }: { armour: number; damage: number }) {
		return damage - damage * this.reduction({ armour, damage });
	},
};
