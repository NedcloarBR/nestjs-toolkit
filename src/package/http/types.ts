export interface StandardResponse<T = unknown> {
	statusCode: number;
	message: string;
	data: T;
	timestamp: string;
	path: string;
}

export interface ErrorResponse {
	statusCode: number;
	message: string | string[];
	error: string;
	timestamp: string;
	path: string;
}

export interface PaginationLinks {
	first?: string;
	previous?: string;
	current?: string;
	next?: string;
	last?: string;
}

export interface PaginatedResponse<T = unknown> {
	statusCode: number;
	message: string;
	data: T[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
	links?: PaginationLinks;
	timestamp: string;
	path: string;
}

/** Compatible with nestjs-typeorm-paginate Pagination<T> */
interface TypeOrmPaginateResult<T> {
	items: T[];
	meta: {
		itemCount: number;
		totalItems?: number;
		itemsPerPage: number;
		totalPages?: number;
		currentPage: number;
	};
	links?: PaginationLinks;
}

/** Compatible with nestjs-paginate Paginated<T> */
interface NestPaginateResult<T> {
	data: T[];
	meta: {
		totalItems: number;
		itemsPerPage: number;
		currentPage: number;
		totalPages: number;
	};
	links?: PaginationLinks & { current?: string };
}

export type PaginationResult<T> = TypeOrmPaginateResult<T> | NestPaginateResult<T>;
