import type { INestApplicationContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CommandRunner } from "nest-commander";
import { CommandMeta } from "nest-commander/src/constants";
import {
	CommandExtraKey,
	type CommandExtraOptions,
} from "../common/decorators/command-extras.decorator";

export function getAllCommands(app: INestApplicationContext) {
	const reflector = app.get(Reflector);

	// biome-ignore lint/complexity/useLiteralKeys: magic acess to private field
	const modules = app["container"].getModules();

	const commands: {
		name: string;
		description: string;
		category?: string;
		instance: CommandRunner;
	}[] = [];

	for (const module of modules.values()) {
		for (const provider of module.providers.values()) {
			const instance = provider.instance;

			if (instance && instance instanceof CommandRunner) {
				const target = provider.metatype;

				const commandMeta = Reflect.getMetadata(CommandMeta, target);

				const extra: CommandExtraOptions | undefined = reflector.get(
					CommandExtraKey,
					target,
				);

				commands.push({
					name: commandMeta?.name,
					description: commandMeta?.description,
					category: extra?.category,
					instance,
				});
			}
		}
	}

	return commands;
}
