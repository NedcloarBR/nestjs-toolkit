import { Injectable, type NestMiddleware } from "@nestjs/common";

export const CLIENT_IP_KEY = "clientIp";

const IP_HEADERS = [
	"cf-connecting-ip",
	"x-real-ip",
	"x-forwarded-for",
	"x-client-ip",
	"x-cluster-client-ip",
	"forwarded-for",
	"forwarded",
] as const;

function extractIp(headers: Record<string, string | string[] | undefined>, remoteAddress?: string): string {
	for (const header of IP_HEADERS) {
		const value = headers[header];
		if (!value) continue;

		const raw = Array.isArray(value) ? value[0] : value;
		const ip = raw.split(",")[0].trim();
		if (ip) return ip;
	}

	return remoteAddress ?? "unknown";
}

@Injectable()
export class ClientIpMiddleware implements NestMiddleware {
	public use(request: Record<string, unknown>, _response: Record<string, unknown>, next: () => void): void {
		const headers = (request["headers"] as Record<string, string | string[] | undefined>) ?? {};
		const remoteAddress =
			(request["ip"] as string | undefined) ??
			((request["connection"] as Record<string, unknown>)?.["remoteAddress"] as string | undefined) ??
			((request["socket"] as Record<string, unknown>)?.["remoteAddress"] as string | undefined);

		request[CLIENT_IP_KEY] = extractIp(headers, remoteAddress);

		next();
	}
}
