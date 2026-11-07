import {
	type DynamicModule,
	Global,
	Module,
	type Provider,
	type Type,
} from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { BUILTIN_COMMANDS } from "./builtin/index.js";
import { CommandRegistry } from "./kernel/command-registry.js";
import { ConsoleKernel } from "./kernel/console-kernel.js";
import {
	CONSOLE_MUTEX,
	type CommandMutex,
	type MutexProvider,
} from "./mutex/mutex.js";
import {
	CONSOLE_OPTIONS,
	type ConsoleModuleOptions,
} from "./options/console.options.js";

function mutexProvider(mutex: Type<CommandMutex> | MutexProvider): Provider {
	return typeof mutex === "function"
		? { provide: CONSOLE_MUTEX, useClass: mutex }
		: { provide: CONSOLE_MUTEX, ...mutex };
}

/** The console itself: the kernel, the registry that finds every @Command, and the built-in commands. */
@Global()
@Module({})
// biome-ignore lint/complexity/noStaticOnlyClass: Module with static forRoot method
export class ConsoleModule {
	public static forRoot({
		mutex,
		...options
	}: ConsoleModuleOptions): DynamicModule {
		return {
			module: ConsoleModule,
			imports: [DiscoveryModule],
			providers: [
				{ provide: CONSOLE_OPTIONS, useValue: options },
				...(mutex ? [mutexProvider(mutex)] : []),
				CommandRegistry,
				ConsoleKernel,
				...BUILTIN_COMMANDS,
			],
			exports: [ConsoleKernel, CommandRegistry],
		};
	}
}
