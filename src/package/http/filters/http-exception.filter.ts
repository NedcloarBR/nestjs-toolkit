import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: Dependency injection
import { HttpAdapterHost } from "@nestjs/core";
import type { ErrorResponse } from "../types";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	public constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	public catch(exception: HttpException, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();
		const request = ctx.getRequest();
		const statusCode = exception.getStatus();
		const exceptionResponse = exception.getResponse();

		let message: string | string[];
		let error: string;

		if (typeof exceptionResponse === "string") {
			message = exceptionResponse;
			error = exception.message;
		} else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
			const res = exceptionResponse as Record<string, unknown>;
			message = (res.message as string | string[]) ?? exception.message;
			error = (res.error as string) ?? exception.name;
		} else {
			message = exception.message;
			error = exception.name;
		}

		const body: ErrorResponse = {
			statusCode,
			message,
			error,
			timestamp: new Date().toISOString(),
			path: httpAdapter.getRequestUrl(request),
		};

		httpAdapter.reply(ctx.getResponse(), body, statusCode);
	}
}
