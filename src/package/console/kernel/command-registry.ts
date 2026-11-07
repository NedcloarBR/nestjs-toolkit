import { Injectable, type OnModuleInit } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Dependency injection
import { DiscoveryService, Reflector } from "@nestjs/core";
import {
	COMMAND_METADATA,
	type CommandOptions,
} from "../command/command.decorator.js";
import { ConsoleCommand } from "../command/console-command.js";
import { type CommandSignature, parseSignature } from "../parsing/signature.js";

export interface RegisteredCommand {
	options: CommandOptions;
	signature: CommandSignature;
	instance: ConsoleCommand;
}

/** Every @Command provider of the application, found where its module registered it. */
@Injectable()
export class CommandRegistry implements OnModuleInit {
	private readonly commands = new Map<string, RegisteredCommand>();

	public constructor(
		private readonly discovery: DiscoveryService,
		private readonly reflector: Reflector,
	) {}

	public onModuleInit(): void {
		for (const wrapper of this.discovery.getProviders()) {
			const { instance, metatype } = wrapper;
			if (!(metatype && instance instanceof ConsoleCommand)) continue;
			const options = this.reflector.get<CommandOptions | undefined>(
				COMMAND_METADATA,
				metatype,
			);
			if (options) this.add(options, instance);
		}
	}

	public find(name: string): RegisteredCommand | undefined {
		return this.commands.get(name);
	}

	/** One entry per command, aliases aside, in name order. */
	public all(): RegisteredCommand[] {
		return [...new Set(this.commands.values())].sort((a, b) =>
			a.signature.name.localeCompare(b.signature.name),
		);
	}

	private add(options: CommandOptions, instance: ConsoleCommand): void {
		const command: RegisteredCommand = {
			options,
			signature: parseSignature(options.signature),
			instance,
		};
		for (const name of [command.signature.name, ...(options.aliases ?? [])]) {
			const taken = this.commands.get(name);
			if (taken && taken.instance !== instance) {
				throw new Error(
					`two commands answer to "${name}": ${taken.instance.constructor.name} and ${instance.constructor.name}`,
				);
			}
			this.commands.set(name, command);
		}
	}
}
