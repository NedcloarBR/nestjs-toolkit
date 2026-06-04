import {
	type CallHandler,
	type ExecutionContext,
	type NestInterceptor,
	RequestTimeoutException,
} from "@nestjs/common";
import { type Observable, TimeoutError, throwError } from "rxjs";
import { catchError, timeout } from "rxjs/operators";

export class TimeoutInterceptor implements NestInterceptor {
	public constructor(private readonly ms: number = 5000) {}

	public intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
		return next.handle().pipe(
			timeout(this.ms),
			catchError((err) => {
				if (err instanceof TimeoutError) {
					return throwError(() => new RequestTimeoutException());
				}
				return throwError(() => err);
			}),
		);
	}
}
