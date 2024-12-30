const formatter_1 = Intl.NumberFormat('ru', { maximumFractionDigits: 1 });
const formatter_0 = Intl.NumberFormat('ru', { maximumFractionDigits: 0 });
export const fmt = (n: number, digits = 0) => {
	switch (digits) {
		case 1:
			return formatter_1.format(n);
		case 0:
		default:
			return formatter_0.format(n);
	}
};
