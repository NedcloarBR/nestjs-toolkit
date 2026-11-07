import type { Type } from "@nestjs/common";
// biome-ignore lint/style/useImportType: Dependency injection
import { ModuleRef } from "@nestjs/core";
import { Command } from "../command/command.decorator.js";
import { ConsoleCommand } from "../command/console-command.js";

/**
 * A REPL over the running application, like Artisan's tinker:
 *
 *     › await get(UsersService).findByEmail("someone@example.com")
 *
 * Every provider is reached by its class or token; `await` works at the top level.
 */
@Command({
	signature: "repl",
	description: "Open an interactive console with the application loaded",
	aliases: ["tinker"],
})
export class ReplCommand extends ConsoleCommand {
	public constructor(private readonly modules: ModuleRef) {
		super();
	}

	public async handle(): Promise<void> {
		// Loaded here so that an application never pays for node:repl unless it opens one.
		const { start } = await import("node:repl");
		this.comment("get(Class) returns the provider; .exit or Ctrl+D to leave.");
		const server = start({ prompt: "› ", useGlobal: false, preview: true });
		Object.assign(server.context, {
			get: <T>(token: Type<T> | string | symbol): T =>
				this.modules.get<T>(token, { strict: false }),
			methods: (target: object): string[] =>
				Object.getOwnPropertyNames(Object.getPrototypeOf(target)).filter(
					(name) => name !== "constructor",
				),
		});
		await new Promise<void>((resolve) => server.on("exit", resolve));
	}
}
