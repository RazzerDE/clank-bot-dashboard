import {duplicateRequestInterceptor} from './duplicate-request';
import { HttpRequest, HttpEvent, HttpResponse } from '@angular/common/http';
import { defer } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

describe('duplicateRequestInterceptor', () => {
  let next: jest.Mock;
  let req: HttpRequest<unknown>;

  beforeEach(() => {
    next = jest.fn();
    req = new HttpRequest('GET', '/api/test', { foo: 'bar' });
  });

  it('should allow a new request and add it to pendingRequests', fakeAsync(() => {
    next.mockReturnValue(defer(() => Promise.resolve(new HttpResponse({ status: 200 }))));
    const obs$ = duplicateRequestInterceptor(req, next);
    let result: HttpEvent<unknown> | undefined;
    obs$.subscribe(res => (result = res));
    tick();
    expect(next).toHaveBeenCalledWith(req);
    expect(result).toBeInstanceOf(HttpResponse);
  }));

  it('should complete immediately if a duplicate request is pending', fakeAsync(() => {
    next.mockReturnValue(defer(() => Promise.resolve(new HttpResponse({ status: 200 }))));
    // First request
    duplicateRequestInterceptor(req, next).subscribe();
    tick();
    // Second request (duplicate)
    let completed = false;
    duplicateRequestInterceptor(req, next).subscribe({
      complete: () => (completed = true),
    });
    tick();
    expect(completed).toBe(true);
  }));

  it('should remove the request from pendingRequests after cooldown', fakeAsync(() => {
    next.mockReturnValue(defer(() => Promise.resolve(new HttpResponse({ status: 200 }))));
    duplicateRequestInterceptor(req, next).subscribe();
    tick();
    // After finalize, a cooldown of 1000ms is set
    tick(1000);
    // Now, the request should be removed and a new request should be allowed
    let called = false;
    next.mockClear();
    duplicateRequestInterceptor(req, next).subscribe(() => (called = true));
    tick();
    expect(called).toBe(true);
    expect(next).toHaveBeenCalled();
  }));

  it('should not allow duplicate requests during cooldown period', fakeAsync(() => {
    next.mockReturnValue(defer(() => Promise.resolve(new HttpResponse({ status: 200 }))));
    duplicateRequestInterceptor(req, next).subscribe();
    tick();
    // Immediately after finalize, still in cooldown
    let completed = false;
    duplicateRequestInterceptor(req, next).subscribe({
      complete: () => (completed = true),
    });
    tick();
    expect(completed).toBe(true);
    // After cooldown
    tick(1000);
    let called = false;
    next.mockClear();
    duplicateRequestInterceptor(req, next).subscribe(() => (called = true));
    tick();
    expect(called).toBe(true);
  }));
});
