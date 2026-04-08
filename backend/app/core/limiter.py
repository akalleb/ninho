try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address

    limiter = Limiter(key_func=get_remote_address)
except Exception:
    class _DummyLimiter:
        enabled = False

        def limit(self, _rule: str):
            def _decorator(func):
                return func

            return _decorator

    limiter = _DummyLimiter()
