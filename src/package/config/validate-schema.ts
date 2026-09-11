import type { ClassConstructor, plainToInstance } from "class-transformer";
import type { getMetadataStorage, validateSync } from "class-validator";
import { AsyncEnvSchemaError } from "./errors/index.js";
import { flattenConstraints } from "./flatten-constraints.js";
import { loadPeer } from "./optional-peer.js";
import type {
	EnvSchema,
	StandardSchemaIssue,
	StandardSchemaV1,
} from "./types.js";

export interface SchemaResult {
	/** The validated object: coerced values and defaults applied. */
	readonly value: Record<string, unknown>;
	/**
	 * The keys this schema declares. Merging whole objects would let a schema's
	 * untouched copy of a variable overwrite another schema's coerced value, so
	 * only these are taken from `value`.
	 */
	readonly keys: ReadonlySet<string>;
	readonly constraints: readonly string[];
}

const TRUE_STRINGS = new Set(["true", "1", "yes", "on"]);
const FALSE_STRINGS = new Set(["false", "0", "no", "off"]);

type MetadataReader = {
	getMetadata?: (key: string, target: object, property: string) => unknown;
};

interface ClassValidator {
	validateSync: typeof validateSync;
	getMetadataStorage: typeof getMetadataStorage;
}

// Callable schemas carry `~standard` too — arktype's types are functions.
function isStandardSchema(schema: unknown): schema is StandardSchemaV1 {
	return (
		(typeof schema === "object" || typeof schema === "function") &&
		schema !== null &&
		"~standard" in schema
	);
}

function flattenIssues(
	issues: readonly StandardSchemaIssue[],
	scope: string,
): string[] {
	return issues.map((issue) => {
		const path = (issue.path ?? [])
			.map((segment) =>
				String(
					typeof segment === "object" && segment !== null
						? segment.key
						: segment,
				),
			)
			.join(".");

		const label = [scope, path].filter(Boolean).join(" ");
		return label ? `${label}: ${issue.message}` : issue.message;
	});
}

function declaredKeys(
	Schema: ClassConstructor<object>,
	validator: ClassValidator,
): Set<string> {
	const metadatas = validator
		.getMetadataStorage()
		.getTargetValidationMetadatas(Schema, "", true, false);

	const keys = new Set(metadatas.map((metadata) => metadata.propertyName));
	for (const key of Object.keys(new Schema())) {
		keys.add(key);
	}

	return keys;
}

function designTypeOf(Schema: ClassConstructor<object>, key: string): unknown {
	return (Reflect as unknown as MetadataReader).getMetadata?.(
		"design:type",
		Schema.prototype,
		key,
	);
}

// class-transformer coerces with Boolean(value) and Number(value), so "false"
// becomes true, any garbage passes as a boolean, and an empty string passes as
// 0. Environment strings are re-read strictly instead, and anything that does
// not parse is put back raw for the validator to reject.
function correctLossyCoercion(
	instance: Record<string, unknown>,
	Schema: ClassConstructor<object>,
	keys: ReadonlySet<string>,
	config: Record<string, unknown>,
): void {
	for (const key of keys) {
		const raw = config[key];
		if (typeof raw !== "string") {
			continue;
		}

		const type = designTypeOf(Schema, key);

		if (type === Boolean) {
			const normalized = raw.trim().toLowerCase();
			instance[key] = TRUE_STRINGS.has(normalized)
				? true
				: FALSE_STRINGS.has(normalized)
					? false
					: raw;
		} else if (type === Number && raw.trim() === "") {
			instance[key] = raw;
		}
	}
}

/**
 * Validates one schema without throwing, so several can be validated together
 * and reported as a single aggregated failure.
 */
export function validateSchema(
	schema: EnvSchema,
	config: Record<string, unknown>,
	options: {
		enableImplicitConversion: boolean;
		scope: string;
		feature: string;
	},
): SchemaResult {
	const { enableImplicitConversion, scope, feature } = options;

	if (isStandardSchema(schema)) {
		const result = schema["~standard"].validate(config);

		if (result instanceof Promise) {
			throw new AsyncEnvSchemaError(schema["~standard"].vendor);
		}

		if (result.issues) {
			return {
				value: {},
				keys: new Set(),
				constraints: flattenIssues(result.issues, scope),
			};
		}

		const value = result.value as Record<string, unknown>;
		return { value, keys: new Set(Object.keys(value)), constraints: [] };
	}

	const { plainToInstance: toInstance } = loadPeer<{
		plainToInstance: typeof plainToInstance;
	}>("class-transformer", feature);
	const validator = loadPeer<ClassValidator>("class-validator", feature);

	const instance = toInstance(schema, config, {
		enableImplicitConversion,
	}) as Record<string, unknown>;
	const keys = declaredKeys(schema, validator);

	if (enableImplicitConversion) {
		correctLossyCoercion(instance, schema, keys, config);
	}

	const errors = validator.validateSync(instance, {
		skipMissingProperties: false,
	});

	return {
		value: instance,
		keys,
		constraints: flattenConstraints(errors, scope),
	};
}
