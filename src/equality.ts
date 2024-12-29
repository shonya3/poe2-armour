export function is_equal<T>(arr_1: Array<T>, arr_2: Array<T>) {
	if (arr_1.length !== arr_2.length) {
		return false;
	}

	for (let i = 0; i < arr_1.length; i++) {
		if (arr_1[i] !== arr_2[i]) {
			return false;
		}
	}

	return true;
}
