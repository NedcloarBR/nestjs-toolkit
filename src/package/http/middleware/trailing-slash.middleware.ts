/** biome-ignore-all lint/correctness/noVoidTypeReturn: Middleware redirection */
import { HttpStatus, Injectable, type NestMiddleware } from "@nestjs/common";

export interface TrailingSlashMiddlewareOptions {
	redirect?: boolean;
	statusCode?:
		| typeof HttpStatus.MOVED_PERMANENTLY
		| typeof HttpStatus.FOUND
		| typeof HttpStatus.TEMPORARY_REDIRECT
		| typeof HttpStatus.PERMANENT_REDIRECT;
}

@Injectable()
export class TrailingSlashMiddleware implements NestMiddleware {
	private readonly redirect: boolean;
	private readonly statusCode: number;

	public constructor(options: TrailingSlashMiddlewareOptions = {}) {
		this.redirect = options.redirect ?? true;
		this.statusCode = options.statusCode ?? HttpStatus.MOVED_PERMANENTLY;
	}

	public use(request: Record<string, unknown>, response: Record<string, unknown>, next: () => void): void {
		const url = request["url"] as string;

		if (!url || url === "/" || !url.endsWith("/")) {
			return next();
		}

		const urlWithoutQuery = url.split("?")[0];
		if (urlWithoutQuery === "/") {
			return next();
		}

		const clean = url.replace(/\/(\?|#|$)/, "$1");

		if (this.redirect) {
			if (typeof response["redirect"] === "function") {
				(response["redirect"] as (statusCode: number, url: string) => void)(this.statusCode, clean);
			} else if (typeof response["status"] === "function") {
				const res = (response["status"] as (code: number) => Record<string, unknown>)(this.statusCode);
				if (typeof res["redirect"] === "function") {
					(res["redirect"] as (url: string) => void)(clean);
				}
			}
			return;
		}

		request["url"] = clean;
		next();
	}
}
