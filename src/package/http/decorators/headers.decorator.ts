import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

export const Headers = createParamDecorator((key: string | undefined, ctx: ExecutionContext): string | Record<string, string> | undefined => {
	const headers = ctx.switchToHttp().getRequest().headers as Record<string, string>;
	return key ? headers[key.toLowerCase()] : headers;
});
