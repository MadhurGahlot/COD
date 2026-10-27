import time
from collections import defaultdict
from threading import Lock
from fastapi import Request, HTTPException, status


class SlidingWindowRateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)
        self.lock = Lock()

    def __call__(self, request: Request):
        # Extract client IP (handle forward headers if behind proxy)
        client_ip = request.headers.get("x-forwarded-for")
        if client_ip:
            client_ip = client_ip.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"

        now = time.time()
        window_start = now - self.window_seconds

        with self.lock:
            # Clean expired timestamps for this IP
            self.requests[client_ip] = [
                ts for ts in self.requests[client_ip] if ts > window_start
            ]

            if len(self.requests[client_ip]) >= self.max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Maximum {self.max_requests} attempts per {self.window_seconds}s. Please wait."
                )

            self.requests[client_ip].append(now)


# Preconfigured rate limiters
login_rate_limiter = SlidingWindowRateLimiter(max_requests=10, window_seconds=60)
register_rate_limiter = SlidingWindowRateLimiter(max_requests=6, window_seconds=60)
