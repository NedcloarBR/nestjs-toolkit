import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { CLIENT_IP_KEY } from "../middleware/client-ip.middleware";

export const ClientIp = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
	const request = ctx.switchToHttp().getRequest();
	return request[CLIENT_IP_KEY] ?? request.ip ?? "unknown";
});
