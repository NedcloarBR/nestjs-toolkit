import {
	type ArgumentsHost,
	Catch,
	type ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
// biome-ignore lint/style/useImportType: Dependency injection
import { HttpAdapterHost } from "@nestjs/core";
import type { ErrorResponse } from "../types";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);

	public constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	public catch(exception: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();
		const request = ctx.getRequest();

		let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = "Internal server error";
		let error = "Internal Server Error";

		if (exception instanceof HttpException) {
			statusCode = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			if (typeof exceptionResponse === "string") {
				message = exceptionResponse;
				error = exception.message;
			} else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
				const res = exceptionResponse as Record<string, unknown>;
				message = (res.message as string) ?? exception.message;
				error = (res.error as string) ?? exception.name;
			}
		} else if (exception instanceof Error) {
			message = exception.message;
			error = exception.name;
			this.logger.error(exception.message, exception.stack);
		} else {
			this.logger.error("Unknown exception", String(exception));
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
