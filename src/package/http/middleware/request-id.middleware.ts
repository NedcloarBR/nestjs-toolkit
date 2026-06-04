import { randomUUID } from "node:crypto";
import { Injectable, type NestMiddleware } from "@nestjs/common";

export const REQUEST_ID_HEADER = "x-request-id";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
	public use(
		request: Record<string, unknown>,
		response: Record<string, unknown>,
		next: () => void,
	): void {
		const id =
			(request["headers"] as Record<string, string>)?.[REQUEST_ID_HEADER] ??
			randomUUID();

		request["requestId"] = id;

		// Express uses setHeader, Fastify uses header
		if (typeof response["setHeader"] === "function") {
			(response["setHeader"] as (key: string, value: string) => void)(
				REQUEST_ID_HEADER,
				id,
			);
		} else if (typeof response["header"] === "function") {
			(response["header"] as (key: string, value: string) => void)(
				REQUEST_ID_HEADER,
				id,
			);
		}

		next();
	}
}
