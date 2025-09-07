import { Injectable, type OnModuleInit } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Module Injection
import { ModuleRef, Reflector } from "@nestjs/core";
import { CommandRunner } from "nest-commander";
import { CommandMeta } from "nest-commander/src/constants";
import {
	CommandExtraKey,
	type CommandExtraOptions,
} from "../common/decorators/command-extras.decorator";
import type { CommandType } from "../types/commands";

@Injectable()
export class CommandsService implements OnModuleInit {
	private commands: CommandType[] = [];

	constructor(
		private reflector: Reflector,
		private moduleRef: ModuleRef,
	) {}

	public onModuleInit() {
		// biome-ignore lint/complexity/useLiteralKeys: Magic access to private field
		// biome-ignore lint/suspicious/noExplicitAny: Magic access to private field
		const modules = (this.moduleRef["container"] as any).getModules();

		for (const module of modules.values()) {
			for (const provider of module.providers.values()) {
				const instance = provider.instance;

				if (instance && instance instanceof CommandRunner) {
					const target = provider.metatype;
					const commandMeta = Reflect.getMetadata(CommandMeta, target);

					const extra: CommandExtraOptions | undefined = this.reflector.get(
						CommandExtraKey,
						target,
					);

					this.commands.push({
						name: commandMeta?.name,
						description: commandMeta?.description,
						category: extra?.category,
						instance,
					});
				}
			}
		}
	}

	public getAll(): CommandType[] {
		return this.commands;
	}
}
