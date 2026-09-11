import type { ValidationError } from "class-validator";

export function flattenConstraints(
	errors: readonly ValidationError[],
	parent = "",
): string[] {
	const messages: string[] = [];

	for (const error of errors) {
		const path = parent ? `${parent} ${error.property}` : error.property;

		for (const message of Object.values(error.constraints ?? {})) {
			messages.push(`${path}: ${message}`);
		}

		if (error.children?.length) {
			messages.push(...flattenConstraints(error.children, path));
		}
	}

	return messages;
}
