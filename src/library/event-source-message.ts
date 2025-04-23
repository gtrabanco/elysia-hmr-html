export function eventSourceMessage<T = unknown>(
	data: T,
	id: number,
	event: string,
	retry: number,
) {
	let result = "";
	if (event) {
		result += `event: ${event}\n`;
	}
	result += `id: ${id}\n`;
	if (retry) {
		result += `retry: ${retry}\n`;
	}

	return `data: ${JSON.stringify(data)}\n\n`;
}
