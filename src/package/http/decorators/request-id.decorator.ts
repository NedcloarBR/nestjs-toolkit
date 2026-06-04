import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { REQUEST_ID_HEADER } from "../middleware/request-id.middleware";

export const RequestId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string | undefined => {
	const request = ctx.switchToHttp().getRequest();
	return request["requestId"] ?? request.headers?.[REQUEST_ID_HEADER];
});
