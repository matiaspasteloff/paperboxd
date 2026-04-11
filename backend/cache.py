import time

_cache: dict = {}


def cache_get(key: str, ttl: int = 300):
    entry = _cache.get(key)
    if entry and (time.time() - entry[0]) < ttl:
        return entry[1]
    return None


def cache_set(key: str, data):
    _cache[key] = (time.time(), data)


def cache_invalidate(prefix: str):
    for k in list(_cache.keys()):
        if k.startswith(prefix):
            del _cache[k]