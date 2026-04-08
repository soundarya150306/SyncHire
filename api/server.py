import sys
import os

# Make the backend directory importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app
from starlette.middleware.base import BaseHTTPMiddleware


class StripApiPrefix(BaseHTTPMiddleware):
    """
    Vercel routes /api/* to this function, but the FastAPI routers
    use paths like /auth/..., /jobs/..., etc. This middleware strips
    the /api prefix before the request reaches the router.
    """
    async def dispatch(self, request, call_next):
        scope = request.scope
        path = scope.get('path', '')
        if path.startswith('/api'):
            new_path = path[4:] or '/'
            # Do NOT force trailing slashes here. 
            # FastAPI's router handles prefix matching and redirects automatically.
            scope['path'] = new_path
            scope['raw_path'] = new_path.encode()
        return await call_next(request)


app.add_middleware(StripApiPrefix)
