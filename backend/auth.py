import json
from functools import lru_cache
from urllib.error import URLError
from urllib.request import urlopen

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwk, jwt
from pydantic import BaseModel

from config import settings

security = HTTPBearer(auto_error=False)


class AuthUser(BaseModel):
    id: str
    email: str | None = None


@lru_cache(maxsize=1)
def _fetch_jwks(jwks_url: str) -> dict:
    try:
        with urlopen(jwks_url, timeout=10) as response:
            return json.loads(response.read())
    except URLError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='Could not fetch Supabase signing keys',
        ) from exc


def _decode_with_jwks(token: str) -> dict:
    if not settings.supabase_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='SUPABASE_URL is not configured',
        )

    header = jwt.get_unverified_header(token)
    algorithm = header.get('alg')
    kid = header.get('kid')

    if algorithm not in {'ES256', 'RS256'} or not kid:
        raise JWTError('Token is not signed with a supported asymmetric algorithm')

    jwks_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
    jwks = _fetch_jwks(jwks_url)

    signing_key = None
    for key_data in jwks.get('keys', []):
        if key_data.get('kid') == kid:
            signing_key = jwk.construct(key_data)
            break

    if signing_key is None:
        _fetch_jwks.cache_clear()
        jwks = _fetch_jwks(jwks_url)
        for key_data in jwks.get('keys', []):
            if key_data.get('kid') == kid:
                signing_key = jwk.construct(key_data)
                break

    if signing_key is None:
        raise JWTError('No matching signing key found')

    return jwt.decode(
        token,
        signing_key,
        algorithms=[algorithm],
        audience='authenticated',
    )


def _decode_with_secret(token: str) -> dict:
    if not settings.supabase_jwt_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='Supabase JWT secret is not configured',
        )

    return jwt.decode(
        token,
        settings.supabase_jwt_secret,
        algorithms=['HS256'],
        audience='authenticated',
    )


def _decode_token(token: str) -> dict:
    header = jwt.get_unverified_header(token)
    algorithm = header.get('alg')

    if algorithm == 'HS256':
        return _decode_with_secret(token)

    if algorithm in {'ES256', 'RS256'}:
        return _decode_with_jwks(token)

    raise JWTError(f'Unsupported JWT algorithm: {algorithm}')


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> AuthUser:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Missing authorization token',
        )

    token = credentials.credentials
    try:
        payload = _decode_token(token)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid authorization token',
        ) from exc

    user_id = payload.get('sub')
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid token payload',
        )

    return AuthUser(id=user_id, email=payload.get('email'))
