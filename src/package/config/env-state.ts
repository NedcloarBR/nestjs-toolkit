// Kept on globalThis under Symbol.for, like CONFIG_ENV_BINDING, so two copies
// of the toolkit in one process still agree on whether a defineEnv ran.
const DEFINE_ENV_RAN = Symbol.for("@nedcloarbr/nestjs-toolkit/define-env-ran");

type EnvState = { [DEFINE_ENV_RAN]?: true };

export function markDefineEnvRan(): void {
	(globalThis as EnvState)[DEFINE_ENV_RAN] = true;
}

export function hasDefineEnvRun(): boolean {
	return (globalThis as EnvState)[DEFINE_ENV_RAN] === true;
}
