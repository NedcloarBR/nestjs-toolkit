import { applyDecorators, SetMetadata } from "@nestjs/common";

export interface CommandExtraOptions {
	category: string;
}

export const CommandExtraKey = "nestjs_toolkit::command::__extra__";

export const CommandExtra = (options: CommandExtraOptions) => {
	return applyDecorators(SetMetadata(CommandExtraKey, options));
};
