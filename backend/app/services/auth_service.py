import httpx
import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from ..core.config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
from ..core.supabase import supabase

logger = logging.getLogger("ninho_api.services.auth")

def create_supabase_user(email: str, password: str, metadata: dict):
    try:
        if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
            target_email = (email or "").strip().lower()
            if not target_email:
                raise HTTPException(status_code=400, detail="Email inválido")

            headers = {
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                "Content-Type": "application/json",
            }

            def _find_user_id_by_email() -> str | None:
                try:
                    def _scan(params: dict) -> str | None:
                        resp = httpx.get(
                            f"{SUPABASE_URL}/auth/v1/admin/users",
                            headers=headers,
                            params=params,
                            timeout=15,
                        )
                        if resp.status_code != 200:
                            return None
                        payload = resp.json()
                        users = payload.get("users") if isinstance(payload, dict) else None
                        if not isinstance(users, list):
                            return None
                        for u in users:
                            if not isinstance(u, dict):
                                continue
                            if (u.get("email") or "").strip().lower() == target_email and u.get("id"):
                                return u["id"]
                        return None

                    user_id = _scan({"page": 1, "per_page": 200, "filter": target_email})
                    if user_id:
                        return user_id

                    for page in range(1, 11):
                        user_id = _scan({"page": page, "per_page": 200})
                        if user_id:
                            return user_id
                    return None
                except Exception:
                    return None

            def _update_user(user_id: str) -> None:
                resp = httpx.put(
                    f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
                    headers=headers,
                    json={"password": password, "email_confirm": True, "user_metadata": metadata},
                    timeout=15,
                )
                if resp.status_code not in (200, 201):
                    detail = ""
                    try:
                        detail = json.dumps(resp.json())
                    except Exception:
                        detail = resp.text or ""
                    raise HTTPException(status_code=400, detail=f"Supabase update_user falhou ({resp.status_code}). {detail}")

            user_id = _find_user_id_by_email()
            if user_id:
                _update_user(user_id)
                logger.info(f"Supabase user updated (admin) for {target_email}")
                return

            create_resp = httpx.post(
                f"{SUPABASE_URL}/auth/v1/admin/users",
                headers=headers,
                json={"email": target_email, "password": password, "email_confirm": True, "user_metadata": metadata},
                timeout=15,
            )
            if create_resp.status_code in (200, 201):
                logger.info(f"Supabase user created (admin) for {target_email}")
                return

            message = ""
            try:
                message = json.dumps(create_resp.json())
            except Exception:
                message = create_resp.text or ""

            if create_resp.status_code in (400, 409, 422):
                user_id = _find_user_id_by_email()
                if user_id:
                    _update_user(user_id)
                    logger.info(f"Supabase user updated (admin) for {target_email}")
                    return

            raise HTTPException(
                status_code=400,
                detail=f"Supabase create_user falhou ({create_resp.status_code}). {message}",
            )

        if not supabase:
            logger.warning("Supabase client not initialized. Skipping Auth user creation.")
            return

        supabase.auth.sign_up(
            {
                "email": email,
                "password": password,
                "options": {"data": metadata},
            }
        )
        logger.info(f"Supabase user created (signup) for {email}")
    except Exception as e:
        logger.error(f"Failed to create Supabase user: {e}")
        raise HTTPException(status_code=400, detail="Não foi possível criar/atualizar o usuário no Supabase Auth. Verifique se o e-mail já existe no Supabase.")


def delete_supabase_auth_user(email: str) -> bool:
    if not (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY):
        return False

    target_email = (email or "").strip().lower()
    if not target_email:
        return False

    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }

    def _scan(params: dict) -> str | None:
        resp = httpx.get(
            f"{SUPABASE_URL}/auth/v1/admin/users",
            headers=headers,
            params=params,
            timeout=15,
        )
        if resp.status_code != 200:
            return None
        payload = resp.json()
        users = payload.get("users") if isinstance(payload, dict) else None
        if not isinstance(users, list):
            return None
        for u in users:
            if not isinstance(u, dict):
                continue
            if (u.get("email") or "").strip().lower() == target_email and u.get("id"):
                return u["id"]
        return None

    user_id = None
    try:
        user_id = _scan({"page": 1, "per_page": 200, "filter": target_email}) or None
        if not user_id:
            for page in range(1, 11):
                user_id = _scan({"page": page, "per_page": 200}) or None
                if user_id:
                    break
    except Exception:
        user_id = None

    if not user_id:
        return False

    resp = httpx.delete(
        f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
        headers=headers,
        timeout=15,
    )
    if resp.status_code in (200, 202, 204):
        return True

    detail = ""
    try:
        detail = json.dumps(resp.json())
    except Exception:
        detail = resp.text or ""
    logger.error(f"Supabase delete_user falhou ({resp.status_code}) para {target_email}: {detail}")
    return False
