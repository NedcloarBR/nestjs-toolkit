import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	Logger,
	type NestInterceptor,
} from "@nestjs/common";
import { type Observable, tap } from "rxjs";
import { REQUEST_ID_HEADER } from "../middleware/request-id.middleware";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger(LoggingInterceptor.name);

	public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
		const ctx = context.switchToHttp();
		const request = ctx.getRequest();
		const response = ctx.getResponse();
		const { method, url, requestId } = request;
		const start = Date.now();

		const prefix = requestId ? `[${requestId}] ` : "";
		this.logger.log(`${prefix}→ ${method} ${url}`);

		return next.handle().pipe(
			tap(() => {
				const duration = Date.now() - start;
				const statusCode = response.statusCode ?? response.raw?.statusCode;
				const id = requestId ?? response.getHeader?.(REQUEST_ID_HEADER) ?? response.getHeader?.(REQUEST_ID_HEADER);
				const logPrefix = id ? `[${id}] ` : "";
				this.logger.log(`${logPrefix}← ${method} ${url} ${statusCode} +${duration}ms`);
			}),
		);
	}
}
