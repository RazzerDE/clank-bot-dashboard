import { HttpInterceptorFn, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

interface PendingRequest {
  key: string;
  cancel$: Subject<void>;
  timeoutId?: number;
}

const pendingRequests: Map<string, PendingRequest> = new Map<string, PendingRequest>();

/**
 * Intercepts outgoing HTTP requests and prevents duplicate requests with the same key from being sent simultaneously.
 * If a request with the same key is already pending, the new request is immediately completed without being sent.
 * Once the original request completes or is cancelled, the key is removed from the pending requests map.
 *
 * @param req The outgoing HTTP request.
 * @param next The next interceptor or backend handler in the chain.
 * @returns An Observable of the HTTP event stream.
 */
export const duplicateRequestInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next) => {
  const key: string = getRequestKey(req);

  if (pendingRequests.has(key)) {
    return new Observable<HttpEvent<unknown>>(observer => {
      observer.complete();
    });
  }

  const cancel$ = new Subject<void>();
  const pendingRequest: PendingRequest = { key, cancel$ };
  pendingRequests.set(key, pendingRequest);

  return next(req).pipe(
    takeUntil(cancel$),
    finalize((): void => {

      const timeoutId = window.setTimeout(() => {
        pendingRequests.delete(key);
      }, 1000);

      const cooldownRequest: PendingRequest = {key, cancel$: new Subject<void>(), timeoutId};
      pendingRequests.set(key, cooldownRequest);
    })
  );
};

/**
 * Generates a unique key for an HTTP request based on its method, URL (including parameters), and body.
 * Used to identify and prevent duplicate requests.
 *
 * @param req The outgoing HTTP request.
 * @returns A string key representing the request.
 */
function getRequestKey(req: HttpRequest<unknown>): string {
  return `${req.method}|${req.urlWithParams}|${JSON.stringify(req.body)}`;
}
