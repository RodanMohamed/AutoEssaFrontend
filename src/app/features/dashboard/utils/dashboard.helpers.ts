export function asString(value: unknown, fallback: string): string {
	return typeof value === 'string' ? value : fallback;
}

export function asNumber(value: unknown, fallback: number): number {
	return typeof value === 'number' ? value : fallback;
}

