import { Injectable, type NestMiddleware, ServiceUnavailableException } from "@nestjs/common";

export interface MaintenanceMiddlewareOptions {
	enabled: boolean | (() => boolean);
	message?: string;
}

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
	private readonly options: Required<MaintenanceMiddlewareOptions>;

	public constructor(options: MaintenanceMiddlewareOptions) {
		this.options = {
			message: "Service is temporarily unavailable. Please try again later.",
			...options,
		};
	}

	public use(_request: Record<string, unknown>, _response: Record<string, unknown>, next: () => void): void {
		const isEnabled =
			typeof this.options.enabled === "function" ? this.options.enabled() : this.options.enabled;

		if (isEnabled) {
			throw new ServiceUnavailableException(this.options.message);
		}

		next();
	}
}
