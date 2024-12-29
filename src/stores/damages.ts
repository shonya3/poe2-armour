import { use_local_storage } from '../hooks/storage';

const value = use_local_storage('damages', [100, 500, 1100]);

export const damages = {
	value,
	add: (damage: number) => {
		value.set(Array.from(new Set([...value.get(), damage])).sort((a, b) => a - b));
	},
	remove: (damage: number) => {
		value.set(value.get().filter(d => d !== damage));
	},
	to_default: () => value.set([100, 500, 1100]),
};
