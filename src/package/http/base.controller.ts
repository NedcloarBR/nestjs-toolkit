import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	HttpStatus,
	NotFoundException,
	UnauthorizedException,
	UnprocessableEntityException,
} from "@nestjs/common";
import type { PaginatedResponse, PaginationResult, StandardResponse } from "./types";

export abstract class BaseController {
	protected ok<T>(data: T, message = "OK", path = ""): StandardResponse<T> {
		return {
			statusCode: HttpStatus.OK,
			message,
			data,
			timestamp: new Date().toISOString(),
			path,
		};
	}

	protected created<T>(data: T, message = "Created", path = ""): StandardResponse<T> {
		return {
			statusCode: HttpStatus.CREATED,
			message,
			data,
			timestamp: new Date().toISOString(),
			path,
		};
	}

	protected accepted<T>(data: T, message = "Accepted", path = ""): StandardResponse<T> {
		return {
			statusCode: HttpStatus.ACCEPTED,
			message,
			data,
			timestamp: new Date().toISOString(),
			path,
		};
	}

	protected partialContent<T>(data: T, message = "Partial Content", path = ""): StandardResponse<T> {
		return {
			statusCode: HttpStatus.PARTIAL_CONTENT,
			message,
			data,
			timestamp: new Date().toISOString(),
			path,
		};
	}

	protected noContent(): null {
		return null;
	}

	protected paginated<T>(result: PaginationResult<T>, message = "OK", path = ""): PaginatedResponse<T> {
		const data = "data" in result ? result.data : result.items;
		const { meta, links } = result;
		const total = meta.totalItems ?? ("itemCount" in meta ? meta.itemCount : 0);
		const totalPages = meta.totalPages ?? 1;

		return {
			statusCode: HttpStatus.OK,
			message,
			data,
			meta: {
				total,
				page: meta.currentPage,
				limit: meta.itemsPerPage,
				totalPages,
			},
			links,
			timestamp: new Date().toISOString(),
			path,
		};
	}

	protected notFound(message = "Not Found"): never {
		throw new NotFoundException(message);
	}

	protected badRequest(message = "Bad Request"): never {
		throw new BadRequestException(message);
	}

	protected conflict(message = "Conflict"): never {
		throw new ConflictException(message);
	}

	protected unprocessable(message = "Unprocessable Entity"): never {
		throw new UnprocessableEntityException(message);
	}

	protected forbidden(message = "Forbidden"): never {
		throw new ForbiddenException(message);
	}

	protected unauthorized(message = "Unauthorized"): never {
		throw new UnauthorizedException(message);
	}
}
