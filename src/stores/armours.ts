import { use_local_storage } from '../hooks/storage';

const default_value = () => [0, 2000, 3000, 6500, 10000];
const value = use_local_storage('armours', default_value());

export const armours = {
	value,
	add: (damage: number) => {
		value.set(Array.from(new Set([...value.get(), damage])).sort((a, b) => a - b));
	},
	remove: (damage: number) => {
		value.set(value.get().filter(d => d !== damage));
	},
	to_default: () => value.set(default_value()),
};
