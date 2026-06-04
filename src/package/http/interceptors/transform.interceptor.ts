import {
	type CallHandler,
	type ExecutionContext,
	HttpStatus,
	Injectable,
	type NestInterceptor,
} from "@nestjs/common";
import { map, type Observable } from "rxjs";
import type { PaginatedResponse, StandardResponse } from "../types";

type FormattedResponse<T> = StandardResponse<T> | PaginatedResponse<T>;

function isAlreadyFormatted<T>(data: unknown): data is FormattedResponse<T> {
	return (
		typeof data === "object" &&
		data !== null &&
		"statusCode" in data &&
		"message" in data &&
		"timestamp" in data &&
		"path" in data
	);
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, FormattedResponse<T>> {
	public intercept(context: ExecutionContext, next: CallHandler<T>): Observable<FormattedResponse<T>> {
		const ctx = context.switchToHttp();
		const request = ctx.getRequest();
		const response = ctx.getResponse();

		return next.handle().pipe(
			map((data) => {
				if (isAlreadyFormatted<T>(data)) return data;

				return {
					statusCode: response.statusCode ?? HttpStatus.OK,
					message: "OK",
					data,
					timestamp: new Date().toISOString(),
					path: request.url,
				};
			}),
		);
	}
}
