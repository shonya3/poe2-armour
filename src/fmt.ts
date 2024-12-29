const formatter_0 = Intl.NumberFormat('ru', { maximumFractionDigits: 0 });
const formatter_1 = Intl.NumberFormat('ru', { maximumFractionDigits: 1 });
export const fmt = (n: number, digits = 0) => {
	switch (digits) {
		case 0:
			return formatter_0.format(n);
		case 1:
		default:
			return formatter_1.format(n);
	}
};
