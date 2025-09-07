import type { CommandRunner } from "nest-commander";

export interface CommandType {
	name: string;
	description: string;
	category?: string;
	instance: CommandRunner;
}
