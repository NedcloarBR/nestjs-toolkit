export interface Choice {
	value: string;
	label: string;
	hint?: string;
}

/** A list of values, a value → label map, or full choices. */
export type Choices =
	| readonly (string | Choice)[]
	| Readonly<Record<string, string>>;

// Array.isArray does not narrow a readonly array out of a union.
function isList(choices: Choices): choices is readonly (string | Choice)[] {
	return Array.isArray(choices);
}

export function normalizeChoices(choices: Choices): Choice[] {
	if (isList(choices)) {
		return choices.map((choice) =>
			typeof choice === "string" ? { value: choice, label: choice } : choice,
		);
	}
	return Object.entries(choices).map(([value, label]) => ({ value, label }));
}

export function matches(choice: Choice, query: string): boolean {
	const needle = query.trim().toLowerCase();
	return (
		!needle ||
		choice.label.toLowerCase().includes(needle) ||
		choice.value.toLowerCase().includes(needle)
	);
}
